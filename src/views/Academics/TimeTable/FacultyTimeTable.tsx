import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'

import { ChaarvyModal, LoadingSpinner } from 'src/reusable_components'
import { useGetFacultyTimetableQuery } from 'src/store/services/adminServices'

type FacultyTimeTableProps = {
  timeSlots: any[]
  dayOfWeekData: DayOfWeek[]
  onClose: () => void
  facultyId: string
}

const FacultyTimeTable = ({ timeSlots, dayOfWeekData, onClose, facultyId }: FacultyTimeTableProps) => {
  const { data: facultyTimetableData, isLoading: isFacultyTimetableLoading } = useGetFacultyTimetableQuery(
    {
      faculty_id: facultyId ?? ''
    },
    {
      skip: !facultyId
    }
  )

  const data = useMemo(() => {
    const timetableData: Record<string, any> = {}

    if (facultyTimetableData) {
      facultyTimetableData.forEach((entry: FacultyTimetableData) => {
        const key = `${entry.day_of_week}_${entry.period_slot_id}`
        timetableData[key] = {
          subject: entry.subject_name,
          segment: entry.segment_name,
          section: entry.section_name,
          medium: entry.medium_name
        }
      })
    }

    return timetableData
  }, [facultyTimetableData])

  return (
    <ChaarvyModal isOpen={true} modalSize='col-12 col-md-10' onClose={onClose} title='Faculty Timetable'>
      {isFacultyTimetableLoading ? (
        <LoadingSpinner />
      ) : (
        <Box
          display='grid'
          gridTemplateColumns={`80px ${timeSlots.map((slot: any) => (slot.isBreak ? '20px' : '0.5fr')).join(' ')}`}
          gap='2px'
          overflow='auto'
          padding={2}
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
              <Box display='flex' flexDirection='column' textAlign='center'>
                {day.day_name.slice(0, 3)}
              </Box>

              {timeSlots.map((slot: any) => {
                const key = `${day.id}_${slot.id}`
                const cell = data[key]

                return (
                  <Box
                    key={key}
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
                          {cell.subject} ({cell.medium.slice(0, 3)} M)
                        </Typography>
                        <Typography fontSize={12} textAlign='center' color='text.secondary'>
                          {cell.segment} - ({cell.section})
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )
              })}
            </React.Fragment>
          ))}
        </Box>
      )}
    </ChaarvyModal>
  )
}

export default FacultyTimeTable
