'use client'

import { LoadingButton } from '@mui/lab'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  ListItemText,
  Popover,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { ModuleRegistry, AllCommunityModule, CellValueChangedEvent, ColDef, ColGroupDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

ModuleRegistry.registerModules([AllCommunityModule])

import 'ag-grid-community/styles/ag-theme-alpine.css'

// --- Types ---
export interface MediumResponse {
  medium_id: string
  medium_name: string
}

export interface SubjectResponse {
  subject_id: string
  subject_name: string
}

export interface ProgramData {
  program_id: string
  program_name: string
  medium_id?: string
  segments: { segment_id: string; segment_name: string }[]
}

export interface FacultyAssignmentRecord {
  mapping_id?: string
  subject_id: string
  program_id: string
  segment_id: string
  status: number
}

export interface ProgramSubjectMapping {
  program_segment_subject_id?: string
  subject_id: string
  program_id: string
  segment_id: string
  status: number
}

interface FacultySubjectsAssignEditorProps {
  availableMediums: MediumResponse[]
  availableSubjects: SubjectResponse[]
  programData: ProgramData[]
  pastData: FacultyAssignmentRecord[]
  programSubjectMappings: ProgramSubjectMapping[]
  isLoading?: boolean
  onSave: (payload: any[]) => Promise<void>
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

// --- Main Editor Component ---
const FacultySubjectsAssignEditor = ({
  availableMediums = [],
  availableSubjects = [],
  programData = [],
  pastData = [],
  programSubjectMappings = [],
  isLoading = false,
  onSave
}: FacultySubjectsAssignEditorProps) => {
  const gridRef = useRef<AgGridReact>(null)
  const originalRowDataRef = useRef<Record<string, any>>({})
  const { triggerToast } = useToast()

  const [selectedMediumIds, setSelectedMediumIds] = useState<string[]>([])
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const [rowData, setRowData] = useState<any[]>([])
  const [changes, setChanges] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const changesRef = useRef(changes)
  useEffect(() => {
    changesRef.current = changes
  }, [changes])

  const [copyPopover, setCopyPopover] = useState<{
    anchorEl: HTMLElement | null
    sourceField: string
    sourceSegmentName: string
    sourceProgramName: string
  } | null>(null)
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])

  const { activePastSet, pastDataLookup } = useMemo(() => {
    const active = new Set<string>()
    const lookup = new Map<string, FacultyAssignmentRecord>()

    pastData.forEach(d => {
      const key = `${d.subject_id}|${d.program_id}|${d.segment_id}`
      lookup.set(key, d)
      if (d.status === 1) active.add(key)
    })

    return { activePastSet: active, pastDataLookup: lookup }
  }, [pastData])

  useEffect(() => {
    const activePastData = pastData.filter(d => d.status === 1)
    const assignedSubjectIds = Array.from(new Set(activePastData.map(d => d.subject_id)))
    setSelectedSubjectIds(assignedSubjectIds)

    const assignedProgramIds = Array.from(new Set(activePastData.map(d => d.program_id)))
    setSelectedProgramIds(assignedProgramIds)
  }, [pastData])

  const filteredProgramData = useMemo(() => {
    if (selectedMediumIds.length === 0) return programData

    return programData.filter(p => (p.medium_id ? selectedMediumIds.includes(p.medium_id) : true))
  }, [programData, selectedMediumIds])

  const activePrograms = useMemo(() => {
    return filteredProgramData.filter(p => selectedProgramIds.includes(p.program_id))
  }, [filteredProgramData, selectedProgramIds])

  // --- Map of perfectly valid combinations to disable grid cells ---
  const validSubjectSegmentSet = useMemo(() => {
    const validSet = new Set<string>()
    programSubjectMappings.forEach(mapping => {
      if (mapping.status === 1) {
        validSet.add(`${mapping.subject_id}|${mapping.program_id}|${mapping.segment_id}`)
      }
    })

    return validSet
  }, [programSubjectMappings])

  // Check if subject is valid for AT LEAST ONE selected program (for dropdown filtering)
  const validSubjectIdsForSelectedPrograms = useMemo(() => {
    const validIds = new Set<string>()
    programSubjectMappings.forEach(mapping => {
      if (mapping.status === 1 && selectedProgramIds.includes(mapping.program_id)) {
        validIds.add(mapping.subject_id)
      }
    })

    return validIds
  }, [programSubjectMappings, selectedProgramIds])

  const filteredAvailableSubjects = useMemo(() => {
    if (selectedProgramIds.length === 0) return []

    return availableSubjects.filter(subject => validSubjectIdsForSelectedPrograms.has(subject.subject_id))
  }, [availableSubjects, validSubjectIdsForSelectedPrograms, selectedProgramIds.length])

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

          const isAssigned = changesRef.current[changeKey] !== undefined ? changesRef.current[changeKey] : dbValue

          row[field] = isAssigned
          row[`${field}_id`] = pastRecord?.mapping_id || null
        })
      })

      originalDataDict[subjectId] = originalRow

      return row
    })

    setRowData(newRowData)
    originalRowDataRef.current = originalDataDict
  }, [selectedSubjectIds, availableSubjects, activePrograms, pastDataLookup])

  const handleMediumChange = useCallback((newIds: string[]) => {
    setSelectedMediumIds(newIds)
  }, [])

  const handleProgramChange = useCallback(
    (newIds: string[]) => {
      const removedPrograms = selectedProgramIds.filter(id => !newIds.includes(id))
      const nextChanges = { ...changesRef.current }
      let hasChangesUpdated = false

      if (removedPrograms.length > 0) {
        Object.keys(nextChanges).forEach(key => {
          const [, programId] = key.split('|')
          if (removedPrograms.includes(programId)) {
            delete nextChanges[key]
            hasChangesUpdated = true
          }
        })
        if (hasChangesUpdated) setChanges(nextChanges)
      }

      const validIdsForNewSelection = new Set(
        programSubjectMappings.filter(m => m.status === 1 && newIds.includes(m.program_id)).map(m => m.subject_id)
      )

      setSelectedSubjectIds(prevSelected => prevSelected.filter(subjectId => validIdsForNewSelection.has(subjectId)))

      setSelectedProgramIds(newIds)
    },
    [selectedProgramIds, programSubjectMappings]
  )

  const handleSubjectChange = useCallback(
    (newIds: string[]) => {
      const removedSubjects = selectedSubjectIds.filter(id => !newIds.includes(id))

      for (const subjectId of removedSubjects) {
        const row = rowData.find(r => r.subjectId === subjectId)
        if (row) {
          const isAssigned = Object.keys(row).some(key => {
            if (key.startsWith('prog_') && !key.endsWith('_id') && row[key] === true) {
              const match = key.match(/prog_(.+?)_seg_/)

              return match ? selectedProgramIds.includes(match[1]) : false
            }

            return false
          })

          if (isAssigned) {
            triggerToast('Cannot uncheck subject. It is assigned to an active segment.', {
              variant: ToastVariants.ERROR
            })

            return
          }
        }
      }
      setSelectedSubjectIds(newIds)
    },
    [selectedSubjectIds, rowData, selectedProgramIds, triggerToast]
  )

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
        mapping_id: row?.[`${field}_id`] || null,
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

          // Only copy if the target cell is valid for this subject
          if (validSubjectSegmentSet.has(`${subjectId}|${pId}|${sId}`)) {
            node.setDataValue(targetField, sourceValue)
          }
        }
      })
    })
    setCopyPopover(null)
  }

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

            // --- DYNAMICALLY DISABLE EDITING ---
            editable: params =>
              validSubjectSegmentSet.has(`${params.data.subjectId}|${prog.program_id}|${seg.segment_id}`),

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
                // Only consider valid cells when calculating "Select All"
                if (validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)) {
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
                    disabled={!hasRows} // Disable header checkbox if no valid rows below
                    onChange={e => {
                      const checked = e.target.checked
                      gridRef.current?.api.forEachNode(node => {
                        // Only assign if the cell is valid
                        if (validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)) {
                          node.setDataValue(field, checked)
                        }
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
              const isValid = validSubjectSegmentSet.has(`${subjectId}|${prog.program_id}|${seg.segment_id}`)

              // --- VISUALLY GREY OUT UNAVAILABLE CELLS ---
              if (!isValid) {
                return {
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  pointerEvents: 'none',
                  opacity: 0.4
                }
              }

              const rawOriginalValue = originalRowDataRef.current[subjectId]?.[params.colDef.field!]
              const originalValueBool = rawOriginalValue === 1 || rawOriginalValue === '1' || rawOriginalValue === true
              const currentValueBool = params.value === 1 || params.value === '1' || params.value === true
              const isChanged = originalValueBool !== currentValueBool

              return {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: isChanged ? '#FFF9C4' : '#ffffff',
                pointerEvents: 'auto', // Explicitly set default
                opacity: 1 // Explicitly set default
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
                // Only consider valid cells when calculating Global "Select All"
                if (validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)) {
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
                  const checked = e.target.checked
                  gridRef.current?.api.forEachNode(node => {
                    activePrograms.forEach(prog => {
                      prog.segments.forEach(seg => {
                        // Only assign if the cell is valid
                        if (validSubjectSegmentSet.has(`${node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)) {
                          node.setDataValue(getField(prog.program_id, seg.segment_id), checked)
                        }
                      })
                    })
                  })
                }}
              />
              <Typography variant='subtitle2' fontWeight='bold' sx={{ letterSpacing: '0.2px' }}>
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
              const isValid = validSubjectSegmentSet.has(
                `${params.node.data.subjectId}|${prog.program_id}|${seg.segment_id}`
              )
              if (isValid) hasValidSegments = true

              // If not valid, it doesn't count against the "checked" status for this row
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
                  const checked = e.target.checked
                  activePrograms.forEach(prog => {
                    prog.segments.forEach(seg => {
                      if (
                        validSubjectSegmentSet.has(`${params.node.data.subjectId}|${prog.program_id}|${seg.segment_id}`)
                      ) {
                        params.node.setDataValue(getField(prog.program_id, seg.segment_id), checked)
                      }
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
  }, [activePrograms, openCopyPopover, validSubjectSegmentSet])

  const selectedMediumValues = useMemo(
    () =>
      selectedMediumIds.map(
        id => availableMediums.find(s => s.medium_id === id) || { medium_id: id, medium_name: 'Loading...' }
      ),
    [selectedMediumIds, availableMediums]
  )
  const selectedProgramValues = useMemo(
    () =>
      selectedProgramIds.map(
        id =>
          filteredProgramData.find(p => p.program_id === id) || {
            program_id: id,
            program_name: 'Loading...',
            segments: []
          }
      ),
    [selectedProgramIds, filteredProgramData]
  )
  const selectedSubjectValues = useMemo(
    () =>
      selectedSubjectIds.map(
        id => filteredAvailableSubjects.find(s => s.subject_id === id) || { subject_id: id, subject_name: 'Loading...' }
      ),
    [selectedSubjectIds, filteredAvailableSubjects]
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction='column' spacing={2} marginX={4} mb={3}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} flexGrow={1}>
          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            loading={isLoading}
            options={availableMediums}
            limitTags={1}
            getOptionLabel={option => option.medium_name}
            value={selectedMediumValues}
            isOptionEqualToValue={(option, value) => option.medium_id === value.medium_id}
            sx={{ flex: 1 }}
            onChange={(event, newValue) => handleMediumChange(newValue.map(v => v.medium_id))}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={option.medium_name} />
              </li>
            )}
            renderInput={params => <TextField {...params} label='1. Select Mediums' placeholder='Search...' />}
          />

          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            loading={isLoading}
            options={filteredProgramData}
            limitTags={1}
            getOptionLabel={option => option.program_name}
            value={selectedProgramValues}
            isOptionEqualToValue={(option, value) => option.program_id === value.program_id}
            sx={{ flex: 1 }}
            onChange={(event, newValue) => handleProgramChange(newValue.map(v => v.program_id))}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={option.program_name} />
              </li>
            )}
            renderInput={params => <TextField {...params} label='2. Select Programs' placeholder='Search...' />}
          />

          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            loading={isLoading}
            options={filteredAvailableSubjects}
            limitTags={1}
            disabled={selectedProgramIds.length === 0}
            getOptionLabel={option => option.subject_name}
            value={selectedSubjectValues}
            isOptionEqualToValue={(option, value) => option.subject_id === value.subject_id}
            sx={{ flex: 1 }}
            onChange={(event, newValue) => handleSubjectChange(newValue.map(v => v.subject_id))}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={option.subject_name} />
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label='3. Select Subjects'
                placeholder={selectedProgramIds.length === 0 ? 'Select programs first...' : 'Search...'}
              />
            )}
          />
        </Stack>

        <Stack direction='row' justifyContent='flex-end'>
          <LoadingButton
            loading={isSubmitting}
            color='success'
            onClick={handleSave}
            variant='contained'
            disabled={Object.keys(changes).length === 0}
            size='small'
            sx={{ minWidth: 140 }}
          >
            Save Changes
          </LoadingButton>
        </Stack>
      </Stack>

      <Box className='ag-theme-alpine' sx={{ height: '50vh', width: '100%' }}>
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
                              onChange={e => {
                                if (e.target.checked) setSelectedTargets(prev => [...prev, field])
                                else setSelectedTargets(prev => prev.filter(f => f !== field))
                              }}
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

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ChaarvyModal } from 'src/reusable_components'
import { CustomDataGrid } from 'src/reusable_components/DataGrid'
import { useGetSubjectsListQuery } from 'src/store/services/listServices'
import {
  useGetAllProgramSegmentsListQuery,
  useGetProgramSegmentSubjectsListQuery
} from 'src/store/services/programServices'

export function FacultyAssignmentPage({
  facultyId,
  isOpen,
  onClose
}: {
  facultyId: string
  isOpen: boolean
  onClose: () => void
}) {
  const mediumsList: any[] = []
  const isMediumsLoading = false
  const { data: subjectsList, isFetching: isSubjectsLoading } = useGetSubjectsListQuery({
    limit: 500,
    offset: 0,
    status_: '1'
  })

  const { data: programSegmentsData, isFetching: isProgramsLoading } = useGetAllProgramSegmentsListQuery()

  const { data: programSubjectData, isFetching: isMappingsLoading } = useGetProgramSegmentSubjectsListQuery(undefined)

  const pastData: FacultyAssignmentRecord[] = []

  const availableMediums = useMemo(() => {
    return (mediumsList ?? []).map((m: any) => ({ medium_id: m.medium_id, medium_name: m.medium_name }))
  }, [mediumsList])

  const availableSubjects = useMemo(() => {
    return (subjectsList ?? [])
      .filter((s: any) => s.status === 1)
      .map((s: any) => ({ subject_id: s.subject_id, subject_name: s.subject_name }))
  }, [subjectsList])

  const [programs, setPrograms] = useState<ProgramData[]>([])

  useEffect(() => {
    if (programSegmentsData) {
      const groupedPrograms: Record<string, ProgramData> = {}
      programSegmentsData.forEach((segment: any) => {
        const { program_id, program_name, segment_id, segment_name, medium_id } = segment

        if (!groupedPrograms[program_id]) {
          groupedPrograms[program_id] = { program_id, program_name, medium_id, segments: [] }
        }
        groupedPrograms[program_id].segments.push({ segment_id, segment_name })
      })
      setPrograms(Object.values(groupedPrograms))
    }
  }, [programSegmentsData])

  const handleSaveAssignments = async (payload: any[]) => {
    const finalPayload = payload.map(item => ({ ...item, faculty_id: facultyId }))
    console.log(finalPayload)
  }

  const isGlobalLoading = isMediumsLoading || isSubjectsLoading || isProgramsLoading || isMappingsLoading

  return (
    <ChaarvyModal isOpen={isOpen} modalSize='col-12 col-md-11' onClose={onClose} title='Faculty Subject Assignment'>
      <FacultySubjectsAssignEditor
        availableMediums={availableMediums}
        availableSubjects={availableSubjects}
        programData={programs}
        pastData={pastData ?? []}
        programSubjectMappings={programSubjectData ?? []}
        isLoading={isGlobalLoading}
        onSave={handleSaveAssignments}
      />
    </ChaarvyModal>
  )
}

export default FacultyAssignmentPage
