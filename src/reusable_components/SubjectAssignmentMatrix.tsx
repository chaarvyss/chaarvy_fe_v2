'use client'

import { LoadingButton } from '@mui/lab'
import { Box, Button, Checkbox, Divider, FormControlLabel, Popover, Stack, Tooltip, Typography } from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { CustomDataGrid } from 'src/reusable_components/DataGrid'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import 'ag-grid-community/styles/ag-theme-alpine.css'

// 2. REGISTER the module right before your types
ModuleRegistry.registerModules([AllCommunityModule])

// --- Types ---
export interface ProgramData {
  program_id: string
  program_name: string
  segments: { segment_id: string; segment_name: string }[]
}

interface SubjectAssignmentMatrixProps {
  availableSubjects: any[]
  activePrograms: ProgramData[]
  selectedSubjectIds: string[]
  pastData: any[]
  validMappings?: any[]
  idFieldName: string
  isLoading?: boolean
  onSave: (payload: any[]) => Promise<void>
}

export interface SubjectAssignmentMatrixHandle {
  hasAssignments: (subjectId: string, programIds: string[]) => boolean
}

// --- Helpers ---
const getField = (programId: string, segmentId: string) => `prog_${programId}_seg_${segmentId}`

const getSegmentColor = (segmentName: string) => {
  let hash = 0
  for (let i = 0; i < segmentName.length; i++) {
    hash = segmentName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360

  return `linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.2) 100%), hsl(${hue}, 85%, 88%)`
}

export const SubjectAssignmentMatrix = forwardRef<SubjectAssignmentMatrixHandle, SubjectAssignmentMatrixProps>(
  (
    { availableSubjects, activePrograms, selectedSubjectIds, pastData, validMappings, idFieldName, isLoading, onSave },
    ref
  ) => {
    const gridRef = useRef<AgGridReact>(null)
    const originalRowDataRef = useRef<Record<string, any>>({})
    const { triggerToast } = useToast()

    const [rowData, setRowData] = useState<any[]>([])
    const [changes, setChanges] = useState<Record<string, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [copyPopover, setCopyPopover] = useState<{
      anchorEl: HTMLElement | null
      sourceField: string
      sourceSegmentName: string
      sourceProgramName: string
    } | null>(null)
    const [selectedTargets, setSelectedTargets] = useState<string[]>([])

    const changesRef = useRef(changes)
    useEffect(() => {
      changesRef.current = changes
    }, [changes])

    // Clean up changes if a program is removed from the filters
    useEffect(() => {
      setChanges(prev => {
        const next = { ...prev }
        let updated = false
        Object.keys(next).forEach(key => {
          const progId = key.split('|')[1]
          if (!activePrograms.find(p => p.program_id === progId)) {
            delete next[key]
            updated = true
          }
        })

        return updated ? next : prev
      })
    }, [activePrograms])

    // --- Lookups ---
    const { pastDataLookup, validSubjectSegmentSet } = useMemo(() => {
      const pastLookup = new Map<string, any>()
      pastData.forEach(d => pastLookup.set(`${d.subject_id}|${d.program_id}|${d.segment_id}`, d))

      const validSet = new Set<string>()
      if (validMappings) {
        validMappings.forEach(m => {
          if (m.status === 1) validSet.add(`${m.subject_id}|${m.program_id}|${m.segment_id}`)
        })
      }

      return { pastDataLookup: pastLookup, validSubjectSegmentSet: validSet }
    }, [pastData, validMappings])

    // --- Expose Validation Method to Parent ---
    useImperativeHandle(ref, () => ({
      hasAssignments: (subjectId: string, programIds: string[]) => {
        const row = rowData.find(r => r.subjectId === subjectId)
        if (!row) return false

        return Object.keys(row).some(key => {
          if (key.startsWith('prog_') && !key.endsWith('_id') && row[key] === true) {
            const match = key.match(/prog_(.+?)_seg_/)

            return match ? programIds.includes(match[1]) : false
          }

          return false
        })
      }
    }))

    // --- Map Row Data ---
    useEffect(() => {
      const originalDataDict: Record<string, any> = {}

      const newRowData = selectedSubjectIds.map(subjectId => {
        const subject = availableSubjects.find(s => s.subject_id === subjectId)
        const row: any = { subjectId, subjectName: subject?.subject_name || 'Unknown' }
        const originalRow: any = { subjectId }

        activePrograms.forEach(prog => {
          prog.segments.forEach(seg => {
            const field = getField(prog.program_id, seg.segment_id)
            const changeKey = `${subjectId}|${prog.program_id}|${seg.segment_id}`
            const pastRecord = pastDataLookup.get(changeKey)

            const dbValue = pastRecord ? pastRecord.status === 1 : false
            originalRow[field] = dbValue

            row[field] = changesRef.current[changeKey] !== undefined ? changesRef.current[changeKey] : dbValue
            row[`${field}_id`] = pastRecord?.[idFieldName] || pastRecord?.program_segment_subject_id || null
          })
        })

        originalDataDict[subjectId] = originalRow

        return row
      })

      setRowData(newRowData)
      originalRowDataRef.current = originalDataDict
    }, [selectedSubjectIds, availableSubjects, activePrograms, pastDataLookup, idFieldName])

    // --- Handlers ---
    const onCellValueChanged = useCallback((params: CellValueChangedEvent) => {
      const field = params.colDef.field as string
      const subjectId = params.data.subjectId
      const newValue = Boolean(params.newValue)
      const originalValue = originalRowDataRef.current[subjectId]?.[field] || false

      const match = field.match(/prog_(.+?)_seg_(.+)/)
      if (!match) return

      const [, programId, segmentId] = match
      const changeKey = `${subjectId}|${programId}|${segmentId}`

      setChanges(prev => {
        const updated = { ...prev }
        if (newValue !== originalValue) updated[changeKey] = newValue
        else delete updated[changeKey]

        return updated
      })

      params.api.refreshCells({ rowNodes: [params.node], columns: ['subjectName'] })
      params.api.refreshHeader()
    }, [])

    const handleSave = async () => {
      const payload = Object.entries(changes).map(([key, value]) => {
        const [subjectId, programId, segmentId] = key.split('|')
        const field = getField(programId, segmentId)
        const row = rowData.find(r => r.subjectId === subjectId)

        return {
          [idFieldName]: row?.[`${field}_id`] || null,
          subject_id: subjectId,
          program_id: programId,
          segment_id: segmentId,
          status: value ? 1 : 0
        }
      })

      if (payload.length === 0) return

      setIsSubmitting(true)
      try {
        await onSave(payload)
        triggerToast('Assignments saved successfully', { variant: ToastVariants.SUCCESS })
        setChanges({})
      } catch (error: any) {
        triggerToast(error?.data?.message || error?.message || 'Failed to save', { variant: ToastVariants.ERROR })
      } finally {
        setIsSubmitting(false)
      }
    }

    const openCopyPopover = useCallback(
      (event: React.MouseEvent<HTMLElement>, field: string, segName: string, progName: string) => {
        setCopyPopover({
          anchorEl: event.currentTarget,
          sourceField: field,
          sourceSegmentName: segName,
          sourceProgramName: progName
        })
        setSelectedTargets([])
      },
      []
    )

    const handleApplyCopy = () => {
      if (!copyPopover || selectedTargets.length === 0) return
      gridRef.current?.api.forEachNode(node => {
        const sourceValue = node.data[copyPopover.sourceField]
        const subjectId = node.data.subjectId

        selectedTargets.forEach(targetField => {
          const match = targetField.match(/prog_(.+?)_seg_(.+)/)
          if (match) {
            const [, pId, sId] = match
            const isValid = validMappings ? validSubjectSegmentSet.has(`${subjectId}|${pId}|${sId}`) : true
            if (isValid) node.setDataValue(targetField, sourceValue)
          }
        })
      })
      setCopyPopover(null)
    }

    // --- Columns ---
    const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
      const dynamicColumns = activePrograms.map(
        (prog): ColGroupDef => ({
          headerName: prog.program_name,
          headerStyle: { backgroundColor: '#ffffff' },
          children: prog.segments.map((seg): ColDef => {
            const field = getField(prog.program_id, seg.segment_id)

            return {
              headerName: seg.segment_name,
              field: field,
              width: 140,
              editable: params =>
                validMappings
                  ? validSubjectSegmentSet.has(`${params.data.subjectId}|${prog.program_id}|${seg.segment_id}`)
                  : true,
              headerStyle: {
                background: getSegmentColor(seg.segment_name),
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)',
                borderBottom: '1px solid #e0e0e0',
                borderRight: '1px solid #e0e0e0'
              },
              headerComponent: (props: any) => {
                let isColChecked = true
                let hasRows = false

                props.api.forEachNode((node: any) => {
                  const isValid = validMappings
                    ? validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)
                    : true
                  if (isValid) {
                    hasRows = true
                    if (!node.data[field]) isColChecked = false
                  }
                })
                if (!hasRows) isColChecked = false

                return (
                  <Stack direction='row' alignItems='center' spacing={0.5} width='100%'>
                    <Checkbox
                      size='small'
                      checked={isColChecked}
                      disabled={!hasRows}
                      onChange={e => {
                        const checked = e.target.checked
                        gridRef.current?.api.forEachNode(node => {
                          const isValid = validMappings
                            ? validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)
                            : true
                          if (isValid) node.setDataValue(field, checked)
                        })
                      }}
                    />
                    <Typography
                      variant='subtitle2'
                      onClick={e => openCopyPopover(e, field, seg.segment_name, prog.program_name)}
                      sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                    >
                      {props.displayName}
                    </Typography>
                  </Stack>
                )
              },
              cellRenderer: 'agCheckboxCellRenderer',
              cellEditor: 'agCheckboxCellEditor',
              cellStyle: params => {
                const subjectId = params.data.subjectId
                const isValid = validMappings
                  ? validSubjectSegmentSet.has(`${subjectId}|${prog.program_id}|${seg.segment_id}`)
                  : true

                if (!isValid)
                  return {
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    pointerEvents: 'none',
                    opacity: 0.4
                  }

                const rawOriginalValue = originalRowDataRef.current[subjectId]?.[params.colDef.field!]
                const isChanged =
                  (rawOriginalValue === 1 || rawOriginalValue === true) !==
                  (params.value === 1 || params.value === true)

                return {
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: isChanged ? '#FFF9C4' : '#ffffff',
                  pointerEvents: 'auto',
                  opacity: 1
                }
              }
            }
          })
        })
      )

      return [
        {
          headerName: 'Subjects',
          field: 'subjectName',
          pinned: 'left',
          width: 250,
          headerStyle: { backgroundColor: '#ffffff' },
          headerComponent: (props: any) => {
            let isGlobalChecked = true
            let hasRows = false

            props.api.forEachNode((node: any) => {
              activePrograms.forEach(prog => {
                prog.segments.forEach(seg => {
                  const isValid = validMappings
                    ? validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)
                    : true
                  if (isValid) {
                    hasRows = true
                    if (!node.data[getField(prog.program_id, seg.segment_id)]) isGlobalChecked = false
                  }
                })
              })
            })
            if (!hasRows) isGlobalChecked = false

            return (
              <Stack direction='row' alignItems='center'>
                <Checkbox
                  size='small'
                  checked={isGlobalChecked}
                  disabled={!hasRows}
                  onChange={e => {
                    gridRef.current?.api.forEachNode(node => {
                      activePrograms.forEach(prog => {
                        prog.segments.forEach(seg => {
                          const isValid = validMappings
                            ? validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)
                            : true
                          if (isValid) node.setDataValue(getField(prog.program_id, seg.segment_id), e.target.checked)
                        })
                      })
                    })
                  }}
                />
                <Typography variant='subtitle2' fontWeight='bold'>
                  Subjects
                </Typography>
              </Stack>
            )
          },
          cellRenderer: (params: any) => {
            if (!params.node || !params.node.data) return null
            let hasValidSegments = false

            const isRowChecked = activePrograms.every(prog =>
              prog.segments.every(seg => {
                const isValid = validMappings
                  ? validSubjectSegmentSet.has(`${params.node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)
                  : true
                if (isValid) hasValidSegments = true

                return isValid ? params.node.data[getField(prog.program_id, seg.segment_id)] : true
              })
            )

            return (
              <Stack direction='row' alignItems='center' sx={{ backgroundColor: '#ffffff', height: '100%', px: 1 }}>
                <Checkbox
                  size='small'
                  checked={isRowChecked && hasValidSegments}
                  disabled={!hasValidSegments}
                  onChange={e => {
                    activePrograms.forEach(prog => {
                      prog.segments.forEach(seg => {
                        const isValid = validMappings
                          ? validSubjectSegmentSet.has(
                              `${params.node.data.subjectId}|${prog.program_id}|${seg.segment_id}`
                            )
                          : true
                        if (isValid)
                          params.node.setDataValue(getField(prog.program_id, seg.segment_id), e.target.checked)
                      })
                    })
                  }}
                />
                <Typography variant='body2' fontWeight={500}>
                  {params.value}
                </Typography>
              </Stack>
            )
          }
        },
        ...dynamicColumns
      ]
    }, [activePrograms, validSubjectSegmentSet, validMappings, openCopyPopover])

    const disableSaveButton = useMemo(() => {
      return Object.keys(changes).length === 0 || isSubmitting
    }, [changes, isSubmitting])

    return (
      <Box sx={{ width: '100%', paddingBottom: '1%', overflow: 'hidden' }}>
        <Stack direction='row' justifyContent='flex-end' mb={2}>
          <Tooltip title={disableSaveButton ? 'No changes to save' : 'Save changes'} placement='top'>
            <LoadingButton
              loading={isSubmitting}
              onClick={handleSave}
              variant='text'
              disabled={disableSaveButton}
              size='small'
            >
              <GetChaarvyIcons
                iconName={ChaarvyIcon.Floppy}
                fontSize='1.5rem'
                color={disableSaveButton ? 'gery' : 'success'}
              />
            </LoadingButton>
          </Tooltip>
        </Stack>

        <Box className='ag-theme-alpine' sx={{ height: '55vh', overflow: 'hidden' }}>
          <CustomDataGrid
            gridRef={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            getRowId={p => p.data.subjectId}
            onCellValueChanged={onCellValueChanged}
            isLoading={isLoading}
          />
        </Box>

        <Popover
          open={Boolean(copyPopover)}
          anchorEl={copyPopover?.anchorEl}
          onClose={() => setCopyPopover(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box p={2} width={320}>
            <Typography variant='subtitle2' fontWeight={700} mb={1}>
              Copy properties of {copyPopover?.sourceSegmentName} ({copyPopover?.sourceProgramName}) to:
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            <Box maxHeight={250} overflow='auto' sx={{ pr: 1 }}>
              {activePrograms.map(prog => {
                const availableSegments = prog.segments.filter(
                  seg => getField(prog.program_id, seg.segment_id) !== copyPopover?.sourceField
                )
                if (availableSegments.length === 0) return null

                return (
                  <Box key={prog.program_id} mb={1.5}>
                    <Typography variant='caption' fontWeight='bold' color='primary'>
                      {prog.program_name}
                    </Typography>
                    <Box display='flex' flexDirection='column' ml={1}>
                      {availableSegments.map(seg => {
                        const field = getField(prog.program_id, seg.segment_id)

                        return (
                          <FormControlLabel
                            key={field}
                            control={
                              <Checkbox
                                size='small'
                                checked={selectedTargets.includes(field)}
                                onChange={e =>
                                  setSelectedTargets(prev =>
                                    e.target.checked ? [...prev, field] : prev.filter(f => f !== field)
                                  )
                                }
                              />
                            }
                            label={<Typography variant='body2'>{seg.segment_name}</Typography>}
                            sx={{ m: 0 }}
                          />
                        )
                      })}
                    </Box>
                  </Box>
                )
              })}
            </Box>
            <Button
              variant='contained'
              fullWidth
              size='small'
              onClick={handleApplyCopy}
              disabled={selectedTargets.length === 0}
              sx={{ mt: 2 }}
            >
              Apply and Continue
            </Button>
          </Box>
        </Popover>
      </Box>
    )
  }
)
