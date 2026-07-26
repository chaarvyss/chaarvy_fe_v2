import { Box, Typography, Popover, Autocomplete, TextField, Card, Button } from '@mui/material'
import React, { useEffect, useState, useMemo } from 'react'

import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import {
  useGetProgramSectionListQuery,
  useLazyGetProgramSegmentMediumsListByProgramIdQuery
} from 'src/store/services/programServices'

// Data
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const timeSlots = [
  { id: 1, name: 'P1' },
  { id: 2, name: 'P2' },
  { id: 4, name: 'P3' },
  { id: 3, name: 'Break', isBreak: true },
  { id: 5, name: 'P4' },
  { id: 6, name: 'P5' },
  { id: 7, name: 'P6' }
]

const subjects = [
  { id: 1, name: 'Maths' },
  { id: 2, name: 'Physics' },
  { id: 3, name: 'English' }
]

const facultyMap: Record<number, any[]> = {
  1: [{ id: 1, name: 'Ramesh' }],
  2: [{ id: 2, name: 'Suresh' }],
  3: [{ id: 3, name: 'Anita' }]
}

type CellData = {
  subject?: any
  faculty?: any
}

interface TimeTableSchedulerBoardProps {
  readonly programId: string | null
  readonly segmentId: string | null
}

export default function TimeTableSchedulerBoard({ programId: program_id, segmentId }: TimeTableSchedulerBoardProps) {
  const [data, setData] = useState<Record<string, CellData>>({})
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
  const [selectedMedium, setSelectedMedium] = useState<any>(null)
  const [selectedSection, setSelectedSection] = useState<string>()

  const [fetchProgramMediums, { data: mediumOptions, isFetching: isMediumsLoading }] =
    useLazyGetProgramSegmentMediumsListByProgramIdQuery()

  const { data: sectionsData } = useGetProgramSectionListQuery(
    { program_id: program_id ?? '' },
    {
      skip: !program_id
    }
  )

  const mediums = useMemo(() => {
    if (!segmentId || !mediumOptions || !sectionsData) return []
    const validMediumIds = new Set(
      sectionsData.filter(sec => sec.segment_id === segmentId && sec.seating_capacity > 0).map(sec => sec.medium_id)
    )

    return mediumOptions.filter(medium => medium.segment_id === segmentId && validMediumIds.has(medium.medium_id))
  }, [segmentId, mediumOptions, sectionsData])

  useEffect(() => {
    if (program_id && segmentId) {
      fetchProgramMediums({ program_id, only_active: true })
    }
  }, [program_id, segmentId, fetchProgramMediums])

  useEffect(() => {
    if (mediums && mediums.length > 0) {
      const isValid = mediums.some(med => med.medium_id === selectedMedium)
      if (!isValid) {
        setSelectedMedium(mediums[0].medium_id)
      }
    } else {
      setSelectedMedium(null)
    }
  }, [mediums, selectedMedium])

  const segmentSections = useMemo(() => {
    if (!segmentId || !sectionsData || !selectedMedium) return []

    const filteredSections = sectionsData.filter(
      section =>
        section.segment_id === segmentId && section.medium_id === selectedMedium && section.seating_capacity > 0
    )

    return Array.from(new Map(filteredSections.map(item => [item.section_id, item])).values())
  }, [segmentId, sectionsData, selectedMedium])

  useEffect(() => {
    if (segmentSections && segmentSections.length > 0) {
      const isValid = segmentSections.some(sec => sec.section_id === selectedSection)
      if (!isValid) {
        setSelectedSection(segmentSections[0].section_id)
      }
    } else {
      setSelectedSection(undefined)
    }
  }, [segmentSections, selectedSection])

  useEffect(() => {
    if (selectedMedium && selectedSection) {
      // TODO: If you have an API hook for fetching timetable data, call it here!
      // Example: fetchTimetable({ medium_id: selectedMedium, section_id: selectedSection })
      //   .unwrap().then(res => setData(formatIncomingData(res)))

      // For now, we clear the local state to prevent data bleeding between sections
      setData({})
    }
  }, [selectedMedium, selectedSection])

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
      [activeCell]: { subject, faculty }
    }))

    handleClose()
  }

  return (
    <Card sx={{ width: '100%', p: 3 }}>
      <>
        <ChaarvyFlex className={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Typography variant='h6' mb={2}>
            Timetable
          </Typography>
          <ChaarvyFlex className={{ gap: 2 }}>
            {isMediumsLoading ? (
              <Typography>Loading sections...</Typography>
            ) : (
              (segmentSections ?? [])?.map(each => (
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
              <Typography>Loading mediums</Typography>
            ) : (
              (mediums ?? [])?.map(each => (
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
        </ChaarvyFlex>

        <Box
          display='grid'
          gridTemplateColumns={`80px ${timeSlots.map(slot => (slot.isBreak ? '20px' : '0.5fr')).join(' ')}`}
          gap='2px'
          overflow='auto'
        >
          {/* Header Row */}
          <Box />
          {timeSlots.map(slot => (
            <Box key={slot.id} textAlign='center' p={1} bgcolor='#f5f5f5'>
              {slot.name}
            </Box>
          ))}

          {/* Rows */}
          {days.map(day => (
            <React.Fragment key={day}>
              {/* Day Column */}
              <ChaarvyFlex className={{ direction: 'column' }}>{day}</ChaarvyFlex>

              {/* Cells */}
              {timeSlots.map(slot => {
                const key = `${day}-${slot.id}`
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
                        <Typography fontSize={13} fontWeight={600}>
                          {cell.subject.name}
                        </Typography>
                        <Typography fontSize={12}>{cell.faculty?.name}</Typography>
                      </Box>
                    )}
                  </Box>
                )
              })}
            </React.Fragment>
          ))}
        </Box>

        {/* Popover */}
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
              options={subjects}
              getOptionLabel={opt => opt.name}
              value={selectedSubject}
              onChange={(_, val) => {
                setSelectedSubject(val)
                setSelectedFaculty(null)
              }}
              renderInput={params => <TextField {...params} label='Subject' size='small' />}
            />

            <Box mt={2}>
              <Autocomplete
                options={selectedSubject ? facultyMap[selectedSubject.id] || [] : []}
                getOptionLabel={opt => opt.name}
                value={selectedFaculty}
                onChange={(_, val) => {
                  setSelectedFaculty(val)
                  handleSave(selectedSubject, val)
                }}
                renderInput={params => <TextField {...params} label='Faculty' size='small' />}
              />
            </Box>
          </Box>
        </Popover>
      </>
    </Card>
  )
}
