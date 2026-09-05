import {
  Box,
  Typography,
  Popover,
  Autocomplete,
  TextField,
  Card,
  Button,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material'
import React, { useEffect, useState, useMemo, useRef } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ChaarvyButton, LoadingSpinner } from 'src/reusable_components'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import {
  useCreateUpdateTimetableMutation,
  useGetClassTimetableQuery,
  useGetDayOfWeekQuery,
  useGetFacultyAvailabilityQuery,
  useGetPeriodTemplateQuery
} from 'src/store/services/adminServices'
import {
  useGetProgramSectionListQuery,
  useLazyGetProgramSegmentMediumsListByProgramIdQuery
} from 'src/store/services/programServices'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import FacultyTimeTable from './FacultyTimeTable'

type CellData = {
  id?: string
  subject: { id: string; name: string }
  faculty: { id: string; name: string }
}

interface TimeTableSchedulerBoardProps {
  readonly programId: string | null
  readonly segmentId: string | null
}

export default function TimeTableSchedulerBoard({ programId: program_id, segmentId }: TimeTableSchedulerBoardProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { triggerToast } = useToast()

  const [data, setData] = useState<Record<string, CellData>>({})
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [activeCell, setActiveCell] = useState<string | null>(null)

  const [selectedSubject, setSelectedSubject] = useState<{ id: string; name: string } | null>(null)
  const [selectedFaculty, setSelectedFaculty] = useState<{ id: string; name: string } | null>(null)

  const [selectedMedium, setSelectedMedium] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string>()

  const [viewFacultyTimetable, setViewFacultyTimetable] = useState<string | undefined>(undefined)

  const [deletedIds, setDeletedIds] = useState<string[]>([])

  const { data: fetchedTemplateData, isFetching: isFetchingTemplate } = useGetPeriodTemplateQuery()
  const { data: dayOfWeekData, isFetching: isDayOfWeekLoading } = useGetDayOfWeekQuery()

  const { data: existingData } = useGetClassTimetableQuery(
    {
      program_id: program_id ?? '',
      segment_id: segmentId ?? '',
      section_id: selectedSection ?? '',
      medium_id: selectedMedium ?? ''
    },
    {
      skip: !program_id || !segmentId || !selectedSection || !selectedMedium
    }
  )

  const [fetchProgramMediums, { data: mediumOptions, isFetching: isMediumsLoading }] =
    useLazyGetProgramSegmentMediumsListByProgramIdQuery()

  const [saveTimetable, { isLoading: isSavingTimetable }] = useCreateUpdateTimetableMutation()

  const { data: facultyAvailabilityData, isFetching: isFacultyAvailabilityLoading } = useGetFacultyAvailabilityQuery(
    {
      program_id: program_id ?? '',
      segment_id: segmentId ?? '',
      medium_id: selectedMedium ?? '',
      section_id: selectedSection ?? ''
    },
    {
      skip: !program_id || !segmentId || !selectedMedium || !selectedSection
    }
  )

  const timeSlots = useMemo(() => {
    if (!fetchedTemplateData || !fetchedTemplateData.slots) return []

    return fetchedTemplateData.slots.map((slot: any) => ({
      ...slot,
      isBreak: slot.isBreak === 1
    }))
  }, [fetchedTemplateData])

  const { data: sectionsData } = useGetProgramSectionListQuery({ program_id: program_id ?? '' }, { skip: !program_id })

  const mediums = useMemo(() => {
    if (!segmentId || !mediumOptions || !sectionsData) return []
    const validMediumIds = new Set(
      sectionsData
        .filter((sec: any) => sec.segment_id === segmentId && sec.seating_capacity > 0)
        .map((sec: any) => sec.medium_id)
    )

    return mediumOptions.filter(
      (medium: any) => medium.segment_id === segmentId && validMediumIds.has(medium.medium_id)
    )
  }, [segmentId, mediumOptions, sectionsData])

  useEffect(() => {
    if (program_id && segmentId) {
      fetchProgramMediums({ program_id, only_active: true })
    }
  }, [program_id, segmentId, fetchProgramMediums])

  useEffect(() => {
    if (mediums && mediums.length > 0) {
      const isValid = mediums.some((med: any) => med.medium_id === selectedMedium)
      if (!isValid) setSelectedMedium(mediums[0].medium_id)
    } else {
      setSelectedMedium(null)
    }
  }, [mediums, selectedMedium])

  const segmentSections = useMemo(() => {
    if (!segmentId || !sectionsData || !selectedMedium) return []
    const filteredSections = sectionsData.filter(
      (section: any) =>
        section.segment_id === segmentId && section.medium_id === selectedMedium && section.seating_capacity > 0
    )

    return Array.from(new Map(filteredSections.map((item: any) => [item.section_id, item])).values())
  }, [segmentId, sectionsData, selectedMedium])

  useEffect(() => {
    if (segmentSections && segmentSections.length > 0) {
      const isValid = segmentSections.some((sec: any) => sec.section_id === selectedSection)
      if (!isValid) setSelectedSection(segmentSections[0].section_id)
    } else {
      setSelectedSection(undefined)
    }
  }, [segmentSections, selectedSection])

  const initializedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedMedium || !selectedSection || !facultyAvailabilityData) return
    const incomingDataSnapshot = JSON.stringify(existingData || [])
    const currentConfig = `${selectedMedium}_${selectedSection}_${incomingDataSnapshot}`

    if (initializedFor.current === currentConfig) return

    if (existingData && existingData.length > 0) {
      const newData: Record<string, CellData> = {}

      existingData.forEach((item: any) => {
        const key = `${item.day_of_week}_${item.period_slot_id}`
        const subjData = facultyAvailabilityData.find((s: any) => s.subject_id === item.subject_id)
        const facData = subjData?.available_faculty?.find((f: any) => f.user_id === item.faculty_id)

        newData[key] = {
          id: item.id,
          subject: {
            id: item.subject_id,
            name: item.subject_name || subjData?.subject || 'Unknown Subject'
          },
          faculty: {
            id: item.faculty_id,
            name: item.faculty_name || facData?.user_name || 'Unknown Faculty'
          }
        }
      })
      setData(newData)
    } else {
      setData({})
    }

    initializedFor.current = currentConfig
  }, [selectedMedium, selectedSection, existingData, facultyAvailabilityData])

  const open = Boolean(anchorEl)

  const handleCellClick = (e: React.MouseEvent<HTMLElement>, key: string) => {
    setAnchorEl(e.currentTarget)
    setActiveCell(key)

    const existing = data[key] || {}
    setSelectedSubject(existing.subject || null)
    setSelectedFaculty(existing.faculty || null)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setActiveCell(null)
  }

  const handleSave = (subject: any, faculty: any) => {
    if (!activeCell) return

    setData(prev => ({
      ...prev,
      [activeCell]: {
        ...prev[activeCell],
        subject,
        faculty
      }
    }))
    handleClose()
  }

  const handleClearCell = () => {
    if (!activeCell) return
    setData(prev => {
      const newState = { ...prev }
      if (prev[activeCell]?.id !== undefined) {
        setDeletedIds(prevDeleted => [...prevDeleted, prev[activeCell]?.id as string])
      }
      delete newState[activeCell]

      return newState
    })
    handleClose()
  }

  const handleSubmit = () => {
    const payload = Object.entries(data)
      .filter(([, cellData]) => cellData.subject && cellData.faculty)
      .map(([key, cellData]) => {
        const [day_of_week, period_slot_id] = key.split('_')

        return {
          id: cellData.id || undefined,
          day_of_week,
          period_slot_id,
          faculty_id: cellData.faculty?.id,
          subject_id: cellData.subject?.id
        }
      })

    if (program_id && segmentId && selectedSection && selectedMedium) {
      saveTimetable({
        params: {
          program_id: program_id,
          segment_id: segmentId,
          section_id: selectedSection,
          medium_id: selectedMedium
        },
        body: { details: payload, deleted_ids: deletedIds }
      })
        .unwrap()
        .then(() => {
          triggerToast('Timetable saved successfully', { variant: ToastVariants.SUCCESS })
          setDeletedIds([])
        })
        .catch(() => {
          triggerToast('Error saving timetable', { variant: ToastVariants.ERROR })
        })
    }
  }

  const activeDayId = activeCell ? activeCell.split('_')[0] : null
  const activeSlotId = activeCell ? activeCell.substring(activeCell.indexOf('_') + 1) : null

  const subjectOptions = useMemo(() => {
    if (!facultyAvailabilityData) return []

    return facultyAvailabilityData.map((d: any) => ({
      id: d.subject_id,
      name: d.subject
    }))
  }, [facultyAvailabilityData])

  const facultyOptions = useMemo(() => {
    if (!selectedSubject || !activeDayId || !activeSlotId) return []

    // --- UPDATED: Always inject the currently selected faculty into the options list
    // This prevents MUI Autocomplete from complaining/clearing if the faculty is booked
    const options: any[] = []
    if (selectedFaculty) {
      options.push(selectedFaculty)
    }

    if (facultyAvailabilityData) {
      const subjectData = facultyAvailabilityData.find((s: any) => s.subject_id === selectedSubject.id)

      if (subjectData && subjectData.available_faculty) {
        const apiOptions = subjectData.available_faculty
          .filter((fac: any) => {
            const dayAvail = fac.availability.find((a: any) => String(a.day_of_week) === String(activeDayId))
            if (!dayAvail || !dayAvail.slots || dayAvail.slots.length === 0) return false

            const availableSlotIds = dayAvail.slots[0].split(',')
            const isFreeInApi = availableSlotIds.includes(activeSlotId)

            if (!isFreeInApi) return false

            const isAssignedLocallyInSameTime = Object.entries(data).some(([gridKey, cellData]) => {
              if (gridKey === activeCell) return false

              const gridDay = gridKey.split('_')[0]
              const gridSlot = gridKey.substring(gridKey.indexOf('_') + 1)

              return gridDay === activeDayId && gridSlot === activeSlotId && cellData.faculty?.id === fac.user_id
            })

            return !isAssignedLocallyInSameTime
          })
          .map((fac: any) => ({
            id: fac.user_id,
            name: fac.user_name
          }))

        // Merge API options with the injected selectedFaculty, avoiding duplicates
        apiOptions.forEach((apiOpt: any) => {
          if (!options.find(opt => opt.id === apiOpt.id)) {
            options.push(apiOpt)
          }
        })
      }
    }

    return options
  }, [selectedSubject, facultyAvailabilityData, activeDayId, activeSlotId, data, activeCell, selectedFaculty])

  const isGlobalLoading = useMemo(
    () => isFetchingTemplate || isMediumsLoading || isDayOfWeekLoading || isFacultyAvailabilityLoading,
    [isFetchingTemplate, isMediumsLoading, isDayOfWeekLoading, isFacultyAvailabilityLoading]
  )

  return (
    <>
      <Card sx={{ width: '100%', p: 3 }}>
        {isGlobalLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <ChaarvyFlex
              className={{
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <ChaarvyFlex className={{ gap: 2 }}>
                {isMediumsLoading ? (
                  <Typography>Loading sections...</Typography>
                ) : isMobile ? (
                  <FormControl size='small' sx={{ minWidth: 140 }}>
                    <Select
                      value={selectedSection || ''}
                      onChange={e => setSelectedSection(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value='' disabled>
                        Select Section
                      </MenuItem>
                      {(segmentSections ?? [])?.map((each: any) => (
                        <MenuItem key={each.section_id} value={each.section_id}>
                          {each.section_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  (segmentSections ?? [])?.map((each: any) => (
                    <Button
                      size='small'
                      key={each.section_id}
                      onClick={() => setSelectedSection(each.section_id)}
                      variant={selectedSection === each.section_id ? 'contained' : 'outlined'}
                    >
                      {each.section_name}
                    </Button>
                  ))
                )}
              </ChaarvyFlex>

              <ChaarvyFlex className={{ gap: 2 }}>
                {isMediumsLoading ? (
                  <Typography>Loading mediums...</Typography>
                ) : isMobile ? (
                  <FormControl size='small' sx={{ minWidth: 140 }}>
                    <Select value={selectedMedium || ''} onChange={e => setSelectedMedium(e.target.value)} displayEmpty>
                      <MenuItem value='' disabled>
                        Select Medium
                      </MenuItem>
                      {(mediums ?? [])?.map((each: any) => (
                        <MenuItem key={each.medium_id} value={each.medium_id}>
                          {each.medium_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  (mediums ?? [])?.map((each: any) => (
                    <Button
                      size='small'
                      key={each.medium_id}
                      onClick={() => setSelectedMedium(each.medium_id)}
                      variant={selectedMedium === each.medium_id ? 'contained' : 'outlined'}
                    >
                      {each.medium_name}
                    </Button>
                  ))
                )}
              </ChaarvyFlex>

              <ChaarvyButton
                loading={isSavingTimetable}
                variant='contained'
                color='success'
                sx={{ textTransform: 'none' }}
                leftIcon={ChaarvyIcon.Floppy}
                size='small'
                onClick={handleSubmit}
              >
                Save
              </ChaarvyButton>
            </ChaarvyFlex>

            <Box
              display='grid'
              gridTemplateColumns={`80px ${timeSlots.map((slot: any) => (slot.isBreak ? '20px' : '0.5fr')).join(' ')}`}
              gap='2px'
              overflow='auto'
            >
              <Box />
              {timeSlots.map((slot: any) => (
                <Box key={slot.id} textAlign='center' p={1} bgcolor='#f5f5f5'>
                  {slot.isBreak ? (
                    ''
                  ) : (
                    <>
                      <Typography variant='subtitle2'>{slot.title}</Typography>
                      <Typography variant='caption'>
                        {slot.start_time} - {slot.end_time}
                      </Typography>
                    </>
                  )}
                </Box>
              ))}

              {(dayOfWeekData ?? []).map((day: any) => (
                <React.Fragment key={day.id}>
                  <ChaarvyFlex className={{ direction: 'column' }}>{day.day_name.slice(0, 3)}</ChaarvyFlex>

                  {timeSlots.map((slot: any) => {
                    const key = `${day.id}_${slot.id}`
                    const cell = data[key]

                    return (
                      <Box
                        key={key}
                        onClick={e => !slot.isBreak && handleCellClick(e, key)}
                        sx={{
                          minHeight: 50,
                          border: '1px solid #ddd',
                          p: 1,
                          minWidth: slot.isBreak ? '20px' : '100px',
                          width: slot.isBreak ? '20px' : 'auto',
                          cursor: slot.isBreak ? 'not-allowed' : 'pointer',
                          bgcolor: slot.isBreak ? '#eee' : '#fff'
                        }}
                      >
                        {cell?.subject && (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <Typography fontSize={13} fontWeight={600} textAlign='center'>
                              {cell.subject.name}
                            </Typography>
                            <Typography fontSize={12} textAlign='center' color='text.secondary'>
                              {cell.faculty?.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )
                  })}
                </React.Fragment>
              ))}
            </Box>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
            >
              <Box p={2} width={250}>
                <Autocomplete
                  options={subjectOptions}
                  getOptionLabel={opt => opt.name}
                  value={selectedSubject}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, val) => {
                    setSelectedSubject(val)
                    setSelectedFaculty(null)
                  }}
                  renderInput={params => <TextField {...params} label='Subject' size='small' />}
                />

                <Box mt={2}>
                  <Autocomplete
                    options={facultyOptions}
                    getOptionLabel={opt => opt.name}
                    value={selectedFaculty}
                    disabled={!selectedSubject}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(_, val) => {
                      setSelectedFaculty(val)
                      handleSave(selectedSubject, val)
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={facultyOptions.length === 0 && selectedSubject ? 'No faculty available' : 'Faculty'}
                        size='small'
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box
                        component='li'
                        {...props}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between !important',
                          alignItems: 'center',
                          width: '100%'
                        }}
                      >
                        <Typography>{option.name}</Typography>

                        <Tooltip title='View Faculty Timetable' placement='top'>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              e.preventDefault()
                              setViewFacultyTimetable(option.id)
                            }}
                            onMouseDown={e => {
                              e.stopPropagation()
                              e.preventDefault()
                            }}
                          >
                            <GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.Information} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  />
                </Box>

                {data[activeCell || ''] && (
                  <Button
                    fullWidth
                    variant='outlined'
                    color='error'
                    size='small'
                    sx={{ mt: 2 }}
                    onClick={handleClearCell}
                  >
                    Clear Slot
                  </Button>
                )}
              </Box>
            </Popover>
          </>
        )}
      </Card>

      {timeSlots && dayOfWeekData && viewFacultyTimetable && (
        <FacultyTimeTable
          timeSlots={timeSlots}
          dayOfWeekData={dayOfWeekData}
          onClose={() => setViewFacultyTimetable(undefined)}
          facultyId={viewFacultyTimetable}
        />
      )}
    </>
  )
}
