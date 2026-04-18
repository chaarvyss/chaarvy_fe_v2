import { Box, Typography, Popover, Autocomplete, TextField, Card, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'

import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import { useLazyGetProgramMediumsListQuery } from 'src/store/services/programServices'

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
  programId: string | null
  segmentId: string | null
}

export default function TimeTableSchedulerBoard({ programId, segmentId }: TimeTableSchedulerBoardProps) {
  const [data, setData] = useState<Record<string, CellData>>({})
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
  const [selectedMedium, setSelectedMedium] = useState<any>(null)

  const [fetchProgramMediums, { data: mediumOptions, isLoading: isMediumsLoading }] =
    useLazyGetProgramMediumsListQuery()

  useEffect(() => {
    if (programId && segmentId) {
      fetchProgramMediums(programId)
        .unwrap()
        .then(res => {
          setSelectedMedium(res[0]?.language_id || null)
        })
    }
  }, [programId, segmentId])

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
              <Typography>Loading...</Typography>
            ) : (
              (mediumOptions ?? [])?.map(each => (
                <Button
                  size='small'
                  key={each.language_id}
                  onClick={() => setSelectedMedium(each.language_id)}
                  variant={selectedMedium === each.language_id ? 'contained' : 'outlined'}
                >
                  {each.language_name}
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
