import { Box, Typography, Grid, Tooltip } from '@mui/material'
import dayjs from 'dayjs'

import { PERIOD_SLOTS, PeriodSlot, PlannedSchedule } from '../types'

interface CalendarGridProps {
  viewMode: 'month' | 'week'
  currentDate: dayjs.Dayjs
  days: dayjs.Dayjs[]
  plannedSchedules: PlannedSchedule[]
  periodSlots?: PeriodSlot[]
  onSelectEmptySlot: (date: string, periodId?: string) => void
  onSelectSchedule: (schedule: PlannedSchedule) => void
}

export const CalendarGrid = ({
  viewMode,
  currentDate,
  days,
  plannedSchedules,
  periodSlots = PERIOD_SLOTS,
  onSelectEmptySlot,
  onSelectSchedule
}: CalendarGridProps) => {
  const renderTopicBlock = (schedule: PlannedSchedule) => {
    const isOverdue = !schedule.completed && dayjs(schedule.date).isBefore(dayjs(), 'day')

    return (
      <Tooltip
        title={`${schedule.topic_name}${schedule.subject_name ? ` (${schedule.subject_name})` : ''}`}
        key={schedule.id}
      >
        <Box
          onClick={e => {
            e.stopPropagation()
            onSelectSchedule(schedule)
          }}
          sx={{
            p: 0.75,
            borderRadius: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: schedule.completed ? '#2e7d32' : isOverdue ? '#c62828' : '#1565c0',
            bgcolor: schedule.completed ? '#e8f5e9' : isOverdue ? '#ffebee' : '#e3f2fd',
            border: '1px solid',
            borderColor: schedule.completed ? '#a5d6a7' : isOverdue ? '#ef9a9a' : '#90caf9',
            transition: 'all 0.15s ease-in-out',
            '&:hover': { filter: 'brightness(0.95)', transform: 'translateY(-1px)' }
          }}
        >
          {schedule.completed ? '✓ ' : ''}
          {schedule.topic_name}
        </Box>
      </Tooltip>
    )
  }

  return (
    <Box>
      {/* Day headers */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', mb: 1, pb: 1 }}>
        {viewMode === 'week' && <Box sx={{ width: 80, flexShrink: 0 }} />}
        <Box sx={{ display: 'flex', flex: 1 }}>
          {viewMode === 'week'
            ? days.map(dayObj => {
                const isToday = dayObj.isSame(dayjs(), 'day')

                return (
                  <Box
                    key={dayObj.format('YYYY-MM-DD')}
                    sx={{
                      flex: 1,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Typography
                      variant='caption'
                      color={isToday ? 'primary.main' : 'text.secondary'}
                      fontWeight={isToday ? 700 : 600}
                      sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}
                    >
                      {dayObj.format('ddd')}
                    </Typography>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isToday ? 'primary.main' : 'transparent',
                        color: isToday ? '#fff' : 'text.primary',
                        fontWeight: isToday ? 700 : 500,
                        fontSize: '0.85rem'
                      }}
                    >
                      {dayObj.date()}
                    </Box>
                  </Box>
                )
              })
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <Box key={d} sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant='subtitle2' color='text.secondary' fontWeight={600}>
                    {d}
                  </Typography>
                </Box>
              ))}
        </Box>
      </Box>

      {/* Month Grid */}
      {viewMode === 'month' && (
        <Grid container>
          {days.map(dayObj => {
            const isToday = dayObj.isSame(dayjs(), 'day')
            const isCurrentMonth = dayObj.isSame(currentDate, 'month')
            const dateStr = dayObj.format('YYYY-MM-DD')
            const isPast = dayObj.isBefore(dayjs(), 'day')

            const daySchedules = plannedSchedules.filter(s => s.date === dateStr)

            return (
              <Grid
                item
                xs={12 / 7}
                key={dateStr}
                onClick={() => {
                  if (!isPast) {
                    onSelectEmptySlot(dateStr)
                  }
                }}
                sx={{
                  minHeight: 120,
                  border: '1px solid #f5f5f5',
                  p: 1,
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  bgcolor: !isCurrentMonth ? '#fafafa' : '#fff',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: isPast ? '#fafafa' : '#f9f9f9' }
                }}
              >
                <Box display='flex' justifyContent='center' mb={1}>
                  <Typography
                    variant='body2'
                    fontWeight={isToday ? 700 : 500}
                    sx={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: isToday ? 'primary.main' : 'transparent',
                      color: isToday ? '#fff' : isCurrentMonth ? 'text.primary' : 'text.disabled'
                    }}
                  >
                    {dayObj.date()}
                  </Typography>
                </Box>

                <Box display='flex' flexDirection='column' gap={0.5}>
                  {daySchedules.map(s => renderTopicBlock(s))}
                </Box>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Week Grid (Time Slots) */}
      {viewMode === 'week' && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {periodSlots.map(slot => (
            <Box key={slot.id} sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
              {/* Time Column */}
              <Box
                sx={{
                  width: 80,
                  flexShrink: 0,
                  p: 1,
                  borderRight: '1px solid #f0f0f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant='caption' fontWeight={700} color='text.primary'>
                  {slot.title}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                  {slot.start_time} - {slot.end_time}
                </Typography>
              </Box>

              {/* Day Columns for this slot */}
              {days.map(dayObj => {
                const dateStr = dayObj.format('YYYY-MM-DD')
                const isPast = dayObj.isBefore(dayjs(), 'day')
                const isBreak = slot.isBreak === 1

                const slotSchedules = plannedSchedules.filter(s => s.date === dateStr && s.period_id === slot.id)

                return (
                  <Box
                    key={`${dateStr}-${slot.id}`}
                    onClick={() => {
                      if (!isPast && !isBreak) {
                        onSelectEmptySlot(dateStr, slot.id)
                      }
                    }}
                    sx={{
                      flex: 1,
                      minHeight: 65,
                      borderRight: '1px solid #f0f0f0',
                      p: 0.75,
                      bgcolor: isBreak ? '#fbfbfb' : isPast ? '#fafafa' : '#fff',
                      cursor: isBreak || isPast ? 'default' : 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: isBreak || isPast ? undefined : '#f9f9f9' }
                    }}
                  >
                    {isBreak ? (
                      <Typography
                        variant='caption'
                        color='text.disabled'
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontStyle: 'italic'
                        }}
                      >
                        {slot.title}
                      </Typography>
                    ) : (
                      <Box display='flex' flexDirection='column' gap={0.5}>
                        {slotSchedules.map(s => renderTopicBlock(s))}
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
