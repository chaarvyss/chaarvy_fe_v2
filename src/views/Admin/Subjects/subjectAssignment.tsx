'use client'

import { LoadingButton } from '@mui/lab'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
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

import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ChaarvyModal } from 'src/reusable_components'
import { useGetSubjectsListQuery } from 'src/store/services/listServices'
import {
  useGetAllProgramSegmentsListQuery,
  useGetProgramSegmentSubjectsListQuery
} from 'src/store/services/programServices'
import { useDebounce } from 'src/utils/hooks/useDebounce'

ModuleRegistry.registerModules([AllCommunityModule])

// --- Types ---
export interface FilterProps {
  limit: number
  offset: number
  status_: string
}

export interface SubjectResponse {
  subject_id: string
  subject_name: string
}

export interface ProgramData {
  program_id: string
  program_name: string
  segments: { segment_id: string; segment_name: string }[]
}

interface SubjectsAssignEditorProps {
  availableSubjects: SubjectResponse[]
  programData: ProgramData[]
  pastData: ProgramSegmentSubject[]
  isLoading?: boolean
  onSave: (payload: any[]) => Promise<void>
}

// --- Helpers ---
const getField = (programId: string, segmentId: string) => `prog_${programId}_seg_${segmentId}`

// Dynamic Glossy Color Generator (Same name = Same color)
const getSegmentColor = (segmentName: string) => {
  let hash = 0
  for (let i = 0; i < segmentName.length; i++) {
    hash = segmentName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360

  return `linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.2) 100%), hsl(${hue}, 85%, 88%)`
}

// --- Main Editor Component ---
const SubjectsAssignEditor = ({
  availableSubjects = [],
  programData = [],
  pastData = [],
  isLoading = false,
  onSave
}: SubjectsAssignEditorProps) => {
  const gridRef = useRef<AgGridReact>(null)
  const originalRowDataRef = useRef<Record<string, any>>({})
  const { triggerToast } = useToast()

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [rowData, setRowData] = useState<any[]>([])
  const [changes, setChanges] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State to track hidden/dragged columns
  const [hiddenColumns, setHiddenColumns] = useState<{ id: string; name: string; colIds: string[] }[]>([])

  // Popover State
  const [copyPopover, setCopyPopover] = useState<{
    anchorEl: HTMLElement | null
    sourceField: string
    sourceSegmentName: string
    sourceProgramName: string
  } | null>(null)
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])

  // Initialize selected subjects based on past data
  useEffect(() => {
    const assignedSubjectIds = Array.from(new Set(pastData.map(d => d.subject_id)))
    setSelectedSubjectIds(assignedSubjectIds)
  }, [pastData])

  // Build grid data whenever selected subjects change
  useEffect(() => {
    // Map to quickly look up the progSegmentSubId
    const pastDataLookup = new Map(
      pastData.map(d => [`${d.subject_id}_${d.program_id}_${d.segment_id}`, d.program_segment_subject_id])
    )

    const newRowData = selectedSubjectIds.map(subjectId => {
      const subject = availableSubjects.find(s => s.subject_id === subjectId)
      const row: any = { subjectId, subjectName: subject?.subject_name || 'Unknown' }

      programData.forEach(prog => {
        prog.segments.forEach(seg => {
          const field = getField(prog.program_id, seg.segment_id)
          const pastId = pastDataLookup.get(`${subjectId}_${prog.program_id}_${seg.segment_id}`)

          row[field] = !!pastId
          row[`${field}_id`] = pastId || null // Store the DB ID for saving later
        })
      })

      return row
    })

    setRowData(newRowData)

    const originalDataDict: Record<string, any> = {}
    newRowData.forEach(row => {
      originalDataDict[row.subjectId] = { ...row }
    })
    originalRowDataRef.current = originalDataDict
    setChanges({})
  }, [selectedSubjectIds, availableSubjects, programData, pastData])

  // Sort available subjects: Selected (ASC) -> Unselected (ASC)
  const sortedSubjects = useMemo(() => {
    return [...availableSubjects].sort((a, b) => {
      const aSelected = selectedSubjectIds.includes(a.subject_id)
      const bSelected = selectedSubjectIds.includes(b.subject_id)

      if (aSelected && !bSelected) return -1
      if (!aSelected && bSelected) return 1

      return a.subject_name.localeCompare(b.subject_name)
    })
  }, [availableSubjects, selectedSubjectIds])

  // Map IDs back to objects for the Autocomplete value
  const selectedValues = useMemo(() => {
    return selectedSubjectIds.map(
      id => availableSubjects.find(s => s.subject_id === id) || { subject_id: id, subject_name: 'Loading...' }
    )
  }, [selectedSubjectIds, availableSubjects])

  // --- Change Tracking & Syncing UI ---
  const onCellValueChanged = useCallback((params: CellValueChangedEvent) => {
    const field = params.colDef.field as string
    const subjectId = params.data.subjectId
    const newValue = Boolean(params.newValue)

    const originalValue = originalRowDataRef.current[subjectId]?.[field] || false
    const changeKey = `${subjectId}_${field}`

    setChanges(prev => {
      const updated = { ...prev }
      if (newValue !== originalValue) {
        updated[changeKey] = newValue
      } else {
        delete updated[changeKey]
      }

      return updated
    })

    params.api.refreshCells({ rowNodes: [params.node], columns: ['subjectName'] })
    params.api.refreshHeader()
  }, [])

  // --- Hidden Columns / Dragging Logic ---
  const syncHiddenColumns = useCallback(() => {
    const columns = gridRef.current?.api.getColumns()
    if (!columns) return

    const hiddenMap = new Map<string, { id: string; name: string; colIds: string[] }>()

    columns
      .filter(col => !col.isVisible())
      .forEach(col => {
        const groups: string[] = []
        let parent = col.getParent()
        while (parent) {
          if (parent.getColGroupDef()?.headerName) groups.unshift(parent.getColGroupDef()!.headerName!)
          parent = parent.getParent()
        }

        const colId = col.getColId()
        for (let level = 1; level <= groups.length + 1; level++) {
          const path = level <= groups.length ? groups.slice(0, level) : [...groups, col.getColDef()?.headerName]
          const key = path.join('__')

          if (!hiddenMap.has(key)) {
            hiddenMap.set(key, { id: key, name: path.join(' > '), colIds: [] })
          }
          hiddenMap.get(key)!.colIds.push(colId)
        }
      })

    const values = Array.from(hiddenMap.values())
    values.forEach(item => {
      item.colIds = [...new Set(item.colIds)]
    })

    setHiddenColumns(
      values.filter(
        item =>
          !values.some(
            other => other !== item && other.id.startsWith(item.id + '__') && other.colIds.length === item.colIds.length
          )
      )
    )
  }, [])

  // --- Save Logic ---
  const handleSave = async () => {
    const payload = Object.entries(changes).map(([key, value]) => {
      const [subjectId, programId, segmentId] = key.split('_')
      const field = getField(programId, segmentId)
      const row = rowData.find(r => r.subjectId === subjectId)

      return {
        progSegmentSubId: row?.[`${field}_id`] || null, // Include the existing ID if it exists
        subject_id: subjectId,
        program_id: programId,
        segment_id: segmentId,
        is_assigned: value
      }
    })

    if (payload.length === 0) return

    setIsSubmitting(true)
    try {
      await onSave(payload)
      triggerToast('Subjects assigned successfully', { variant: ToastVariants.SUCCESS })
    } catch (error: any) {
      triggerToast(error?.message || 'Failed to save assignments', { variant: ToastVariants.ERROR })
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Copy Popover Handlers ---
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
      selectedTargets.forEach(targetField => {
        node.setDataValue(targetField, sourceValue)
      })
    })
    setCopyPopover(null)
  }

  // --- Grid Column Definitions ---
  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
    const dynamicColumns = programData.map(
      (prog): ColGroupDef => ({
        headerName: prog.program_name,
        headerStyle: { backgroundColor: '#ffffff' },
        children: prog.segments.map((seg): ColDef => {
          const field = getField(prog.program_id, seg.segment_id)

          return {
            headerName: seg.segment_name,
            field: field,
            width: 140,
            editable: true, // MUST be true for agCheckboxCellEditor to trigger on click
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
                hasRows = true
                if (!node.data[field]) isColChecked = false
              })
              if (!hasRows) isColChecked = false

              return (
                <Stack direction='row' alignItems='center' spacing={0.5} width='100%'>
                  <Checkbox
                    size='small'
                    checked={isColChecked}
                    onChange={e => {
                      const checked = e.target.checked
                      gridRef.current?.api.forEachNode(node => {
                        node.setDataValue(field, checked)
                      })
                    }}
                  />
                  <Typography
                    variant='subtitle2'
                    onClick={e => openCopyPopover(e, field, seg.segment_name, prog.program_name)}
                    sx={{
                      flexGrow: 1,
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.2px',
                      textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                      '&:hover': { opacity: 0.7 }
                    }}
                  >
                    {props.displayName}
                  </Typography>
                </Stack>
              )
            },
            cellRenderer: 'agCheckboxCellRenderer',
            cellEditor: 'agCheckboxCellEditor',
            cellStyle: params => {
              const originalValue = originalRowDataRef.current[params.data.subjectId]?.[params.colDef.field!] || false
              const isChanged = originalValue !== params.value

              return {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: isChanged ? '#FFF9C4' : '#ffffff'
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
            hasRows = true
            programData.forEach(prog => {
              prog.segments.forEach(seg => {
                if (!node.data[getField(prog.program_id, seg.segment_id)]) isGlobalChecked = false
              })
            })
          })
          if (!hasRows) isGlobalChecked = false

          return (
            <Stack direction='row' alignItems='center'>
              <Checkbox
                size='small'
                checked={isGlobalChecked}
                onChange={e => {
                  const checked = e.target.checked
                  gridRef.current?.api.forEachNode(node => {
                    programData.forEach(prog => {
                      prog.segments.forEach(seg => {
                        node.setDataValue(getField(prog.program_id, seg.segment_id), checked)
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

          const isRowChecked = programData.every(prog =>
            prog.segments.every(seg => params.node.data[getField(prog.program_id, seg.segment_id)])
          )

          return (
            <Stack direction='row' alignItems='center' sx={{ backgroundColor: '#ffffff', height: '100%', px: 1 }}>
              <Checkbox
                size='small'
                checked={isRowChecked}
                onChange={e => {
                  const checked = e.target.checked
                  programData.forEach(prog => {
                    prog.segments.forEach(seg => {
                      params.node.setDataValue(getField(prog.program_id, seg.segment_id), checked)
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
  }, [programData, openCopyPopover])

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' marginX={4} mb={3}>
        <Box width={{ xs: '100%', sm: 400 }}>
          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            loading={isLoading}
            options={sortedSubjects}
            limitTags={2}
            getOptionLabel={option => option.subject_name}
            value={selectedValues}
            isOptionEqualToValue={(option, value) => option.subject_id === value.subject_id}
            onChange={(event, newValue) => {
              const newIds = newValue.map(v => v.subject_id)
              const removedSubjects = selectedSubjectIds.filter(id => !newIds.includes(id))

              for (const subjectId of removedSubjects) {
                const row = rowData.find(r => r.subjectId === subjectId)
                if (row) {
                  // Ignore fields that end with '_id' to correctly validate assignments
                  const isAssigned = Object.keys(row).some(
                    key => key.startsWith('prog_') && !key.endsWith('_id') && row[key] === true
                  )

                  if (isAssigned) {
                    triggerToast('Cannot uncheck subject. It is assigned to a segment in the grid.', {
                      variant: ToastVariants.ERROR
                    })

                    return // Block the state update
                  }
                }
              }
              setSelectedSubjectIds(newIds)
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox style={{ marginRight: 8 }} checked={selected} size='small' />
                <ListItemText primary={option.subject_name} />
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label='Search & Select Subjects'
                placeholder='Search...'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress color='inherit' size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </Box>

        <LoadingButton
          loading={isSubmitting}
          color='success'
          onClick={handleSave}
          variant='contained'
          disabled={Object.keys(changes).length === 0}
          size='small'
        >
          Save Changes
        </LoadingButton>
      </Stack>

      {/* RENDER DRAGGED / HIDDEN COLUMNS HERE */}
      {hiddenColumns.length > 0 && (
        <Box
          marginX={4}
          mb={2}
          display='flex'
          gap={1.5}
          flexWrap='wrap'
          alignItems='center'
          sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}
        >
          <Typography variant='body2' fontWeight={600} color='text.secondary'>
            Hidden Segments:
          </Typography>
          {hiddenColumns.map(column => (
            <Chip
              key={column.id}
              label={column.name}
              color='primary'
              variant='outlined'
              onClick={() => gridRef.current?.api?.setColumnsVisible(column.colIds, true)}
              onDelete={() => gridRef.current?.api?.setColumnsVisible(column.colIds, true)}
            />
          ))}
        </Box>
      )}

      <Box className='ag-theme-alpine' sx={{ height: '55vh', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          getRowId={p => p.data.subjectId}
          onCellValueChanged={onCellValueChanged}
          onColumnVisible={syncHiddenColumns}
          onColumnMoved={syncHiddenColumns}
          suppressDragLeaveHidesColumns={false}
          defaultColDef={{ resizable: true, sortable: false, filter: false }}
          undoRedoCellEditing
          undoRedoCellEditingLimit={100}
        />
      </Box>

      {/* Targets Popover for Copy Logic */}
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
            {programData.map(prog => {
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

export function SubjectAssignmentPage() {
  const [filterProps] = useState<FilterProps>({ limit: 100, offset: 0, status_: '1' })
  const filterP = useDebounce(filterProps, 500)
  const { data: subjectsList, isLoading, isFetching } = useGetSubjectsListQuery(filterP)

  const { data: programSegmentsData, isFetching: isProgramSegmentsLoading } = useGetAllProgramSegmentsListQuery()
  const [programs, setPrograms] = useState<ProgramData[]>([])

  useEffect(() => {
    if (programSegmentsData) {
      const groupedPrograms: Record<string, ProgramData> = {}
      programSegmentsData.forEach((segment: any) => {
        const { program_id, program_name, segment_id, segment_name } = segment

        if (!groupedPrograms[program_id]) {
          groupedPrograms[program_id] = {
            program_id,
            program_name,
            segments: []
          }
        }

        groupedPrograms[program_id].segments.push({ segment_id, segment_name })
      })
      setPrograms(Object.values(groupedPrograms))
    }
  }, [programSegmentsData])

  const { data: pastData } = useGetProgramSegmentSubjectsListQuery(undefined)

  const handleSaveAssignments = async (payload: any[]) => {
    return new Promise<void>(resolve => {
      console.log('🚀 Payload being sent to server:', payload)
      setTimeout(() => {
        resolve()
      }, 1500)
    })
  }

  // Derive available subjects list
  const availableSubjects = useMemo(() => {
    return (subjectsList ?? [])
      .filter((each: any) => each.status === 1)
      .map((s: any) => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name
      }))
  }, [subjectsList])

  return (
    <ChaarvyModal isOpen={true} modalSize='col-12 col-md-10' onClose={() => {}} title='Subject Assignment'>
      <SubjectsAssignEditor
        availableSubjects={availableSubjects}
        programData={programs}
        pastData={pastData ?? []}
        isLoading={isLoading || isFetching || isProgramSegmentsLoading} // Pass loading state to editor
        onSave={handleSaveAssignments}
      />
    </ChaarvyModal>
  )
}

export default SubjectAssignmentPage
