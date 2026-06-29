'use client'

import { LoadingButton } from '@mui/lab'
import { Stack, Typography } from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'

import 'ag-grid-community/styles/ag-theme-alpine.css'

ModuleRegistry.registerModules([AllCommunityModule])

// ==========================================
// 1. MOCK DATA (Replace with API data later)
// ==========================================
const MOCK_SUBJECTS = [
  { subject_id: 'sub_1', subject_name: 'Mathematics' },
  { subject_id: 'sub_2', subject_name: 'Physics' },
  { subject_id: 'sub_3', subject_name: 'English' },
  { subject_id: 'sub_4', subject_name: 'Chemistry' }
]

const MOCK_STRUCTURE = [
  {
    medium_id: 'med_eng',
    medium_name: 'English Medium',
    color: '#e3f2fd', // Light Blue
    programs: [
      {
        program_id: 'prog_sec',
        program_name: 'Secondary',
        color: '#f3e5f5', // Light Purple
        segments: [
          { segment_id: 'seg_8', segment_name: '8th Grade' },
          { segment_id: 'seg_9', segment_name: '9th Grade' },
          { segment_id: 'seg_10', segment_name: '10th Grade' }
        ]
      },
      {
        program_id: 'prog_inter',
        program_name: 'Inter',
        color: '#e8f5e9', // Light Green
        segments: [
          { segment_id: 'seg_jr', segment_name: 'Jr Inter' },
          { segment_id: 'seg_sr', segment_name: 'Sr Inter' }
        ]
      }
    ]
  },
  {
    medium_id: 'med_tel',
    medium_name: 'Telugu Medium',
    color: '#fff3e0', // Light Orange
    programs: [
      {
        program_id: 'prog_sec',
        program_name: 'Secondary',
        color: '#f3e5f5',
        segments: [
          { segment_id: 'seg_8', segment_name: '8th Grade' },
          { segment_id: 'seg_9', segment_name: '9th Grade' },
          { segment_id: 'seg_10', segment_name: '10th Grade' }
        ]
      }
    ]
  }
]

// Mocking the database assignments (e.g., this teacher already teaches 8th & 9th Math in English)
const MOCK_EXISTING_ASSIGNMENTS = [
  { subject_id: 'sub_1', medium_id: 'med_eng', program_id: 'prog_sec', segment_id: 'seg_8' },
  { subject_id: 'sub_1', medium_id: 'med_eng', program_id: 'prog_sec', segment_id: 'seg_9' }
]

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================
const getFieldKey = (mediumId: string, programId: string, segmentId: string) =>
  `m_${mediumId}_p_${programId}_s_${segmentId}`

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

interface FacultySubjectAssignmentProps {
  teacherId?: string // Passed in from the parent form
}

const FacultySubjectAssignment = ({ teacherId = 'mock_teacher_123' }: FacultySubjectAssignmentProps) => {
  const gridRef = useRef<AgGridReact>(null)
  const originalRowDataRef = useRef<Record<string, any>>({})
  const { triggerToast } = useToast()

  const [rowData, setRowData] = useState<any[]>([])
  const [changes, setChanges] = useState<Record<string, boolean>>({}) // Tracks modified cells
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --------------------------------------------------------
  // A. Build Initial Row Data from Mocks
  // --------------------------------------------------------
  useEffect(() => {
    // Convert existing assignments into a quick lookup dictionary
    const assignmentLookup: Record<string, boolean> = {}
    MOCK_EXISTING_ASSIGNMENTS.forEach(a => {
      const key = `${a.subject_id}_${getFieldKey(a.medium_id, a.program_id, a.segment_id)}`
      assignmentLookup[key] = true
    })

    // Generate one row per subject
    const initialRows = MOCK_SUBJECTS.map(subject => {
      const row: any = {
        subjectName: subject.subject_name,
        subjectId: subject.subject_id
      }

      // Populate cells with true/false based on existing assignments
      MOCK_STRUCTURE.forEach(medium => {
        medium.programs.forEach(program => {
          program.segments.forEach(segment => {
            const field = getFieldKey(medium.medium_id, program.program_id, segment.segment_id)
            const isAssigned = assignmentLookup[`${subject.subject_id}_${field}`] || false
            row[field] = isAssigned
          })
        })
      })

      return row
    })

    setRowData(initialRows)

    // Save a deep copy to compare against for highlighting changed cells
    const originalDataDict: Record<string, any> = {}
    initialRows.forEach(row => {
      originalDataDict[row.subjectId] = { ...row }
    })
    originalRowDataRef.current = originalDataDict
  }, [])

  // --------------------------------------------------------
  // B. Handle Cell Interactions
  // --------------------------------------------------------
  const onCellValueChanged = (params: CellValueChangedEvent) => {
    const field = params.colDef.field as string
    const subjectId = params.data.subjectId
    const newValue = Boolean(params.newValue) // Ensure it's a strict boolean

    // Track the change
    const changeKey = `${subjectId}_${field}`

    setChanges(prev => {
      const newChanges = { ...prev }
      const originalValue = originalRowDataRef.current[subjectId]?.[field]

      // If the user changed it back to the original value, remove it from the changes payload
      if (newValue === originalValue) {
        delete newChanges[changeKey]
      } else {
        newChanges[changeKey] = newValue
      }

      return newChanges
    })

    // Update local grid state
    setRowData(prev => prev.map(row => (row.subjectId === subjectId ? { ...row, [field]: newValue } : row)))
  }

  // --------------------------------------------------------
  // C. Generate API Payload on Save
  // --------------------------------------------------------
  const saveChanges = async () => {
    setIsSubmitting(true)

    // Parse the changes dictionary into a clean array for the backend
    const payload = Object.entries(changes).map(([key, isAssigned]) => {
      // Key format: "subjectId_m_mediumId_p_programId_s_segmentId"
      // We split by '_' but note that IDs might contain '_' themselves.
      // A safer extraction based on our getFieldKey structure:
      const parts = key.split('_m_')
      const subjectId = parts[0]
      const structureParts = parts[1].split('_p_')
      const mediumId = structureParts[0]
      const segParts = structureParts[1].split('_s_')
      const programId = segParts[0]
      const segmentId = segParts[1]

      return {
        user_id: teacherId,
        subject_id: subjectId,
        medium_id: mediumId,
        program_id: programId,
        segment_id: segmentId,
        is_assigned: isAssigned // true means add record, false means delete record
      }
    })

    console.log('🚀 Payload ready for API:', payload)

    // MOCK API CALL
    setTimeout(() => {
      triggerToast('Teacher assignments updated successfully!', { variant: ToastVariants.SUCCESS })
      setIsSubmitting(false)

      // Reset changes tracker after successful save
      originalRowDataRef.current = rowData.reduce((acc, row) => {
        acc[row.subjectId] = { ...row }

        return acc
      }, {})
      setChanges({})
    }, 1000)
  }

  // --------------------------------------------------------
  // D. Build Dynamic Nested Columns
  // --------------------------------------------------------
  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: 'Subject',
        field: 'subjectName',
        pinned: 'left',
        width: 200,
        editable: false,
        cellStyle: { fontWeight: 600, backgroundColor: '#fafafa' }
      },
      ...MOCK_STRUCTURE.map(
        (medium): ColGroupDef => ({
          headerName: medium.medium_name,
          headerStyle: {
            background: medium.color,
            textAlign: 'center',
            fontWeight: 600,
            borderBottom: '1px solid #ddd'
          },
          children: medium.programs.map(
            (program): ColGroupDef => ({
              headerName: program.program_name,
              headerStyle: {
                background: program.color,
                textAlign: 'center',
                fontWeight: 600,
                borderBottom: '1px solid #ddd'
              },
              children: program.segments.map((segment): ColDef => {
                const field = getFieldKey(medium.medium_id, program.program_id, segment.segment_id)

                return {
                  headerName: segment.segment_name,
                  field: field,
                  width: 120,
                  cellDataType: 'boolean', // Renders a native AG Grid Checkbox
                  editable: true,
                  cellStyle: params => {
                    const subjectId = params.data.subjectId
                    const originalValue = originalRowDataRef.current[subjectId]?.[field]
                    const changed = originalValue !== params.value

                    // Highlight edited cells in a soft yellow so the user knows what they changed
                    return {
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      ...(changed && { backgroundColor: '#FFF9C4' })
                    }
                  }
                }
              })
            })
          )
        })
      )
    ],
    []
  )

  return (
    <>
      <Stack direction='row' justifyContent='space-between' alignItems='center' marginX={4} mb={2}>
        <Typography variant='h6' fontWeight={600}>
          Teacher Subject Assignment
        </Typography>
        <LoadingButton
          loading={isSubmitting}
          color='primary'
          onClick={saveChanges}
          variant='contained'
          disabled={Object.keys(changes).length === 0}
        >
          Save Assignments
        </LoadingButton>
      </Stack>

      {/* Grid Container */}
      <div className='ag-theme-alpine' style={{ height: '65vh', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          getRowId={p => String(p.data.subjectId)}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{ resizable: true, sortable: false, filter: false, suppressMovable: true }}
          undoRedoCellEditing
          undoRedoCellEditingLimit={20}
        />
      </div>
    </>
  )
}

export default FacultySubjectAssignment
