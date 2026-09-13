import { Box, Typography, Grid, Tooltip, Chip } from '@mui/material'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'

import { PERIOD_SLOTS, PeriodSlot, PlannedSchedule, HolidayItem, FacultyTimetableItem } from '../types'

interface CalendarGridProps {
  viewMode: 'month' | 'week'
  currentDate: dayjs.Dayjs
  days: dayjs.Dayjs[]
  plannedSchedules: PlannedSchedule[]
  periodSlots?: PeriodSlot[]
  holidays?: HolidayItem[]
  facultyTimetable?: FacultyTimetableItem[]
  onSelectEmptySlot: (date: string, periodId?: string) => void
  onSelectSchedule: (schedule: PlannedSchedule) => void
}

export const CalendarGrid = ({
  viewMode,
  currentDate,
  days,
  plannedSchedules,
  periodSlots = PERIOD_SLOTS,
  holidays = [],
  facultyTimetable = [],
  onSelectEmptySlot,
  onSelectSchedule
}: CalendarGridProps) => {
  const holidayMap = useMemo(() => {
    const map = new Map<string, string>()
    ;(holidays ?? []).forEach(h => {
      if (h?.date) {
        map.set(dayjs(h.date).format('YYYY-MM-DD'), h.holiday_name || 'Holiday')
      }
    })

    return map
  }, [holidays])

  const timetableMap = useMemo(() => {
    const map = new Map<string, FacultyTimetableItem[]>()
    ;(facultyTimetable ?? []).forEach(entry => {
      if (entry?.period_slot_id && entry?.day_of_week !== undefined) {
        const key = `${Number(entry.day_of_week)}_${entry.period_slot_id}`
        const existing = map.get(key) || []
        existing.push(entry)
        map.set(key, existing)
      }
    })

    return map
  }, [facultyTimetable])

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
                const dateStr = dayObj.format('YYYY-MM-DD')
                const isToday = dayObj.isSame(dayjs(), 'day')
                const holidayName = holidayMap.get(dateStr)
                const isHoliday = Boolean(holidayName)
                const isSunday = dayObj.day() === 0

                return (
                  <Box
                    key={dateStr}
                    sx={{
                      flex: 1,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pb: 0.5
                    }}
                  >
                    <Typography
                      variant='caption'
                      color={isToday ? 'primary.main' : isHoliday ? '#b45309' : isSunday ? '#64748b' : 'text.secondary'}
                      fontWeight={isToday || isHoliday || isSunday ? 700 : 600}
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
                        bgcolor: isToday
                          ? 'primary.main'
                          : isHoliday
                            ? '#fef3c7'
                            : isSunday
                              ? '#f1f5f9'
                              : 'transparent',
                        color: isToday ? '#fff' : isHoliday ? '#b45309' : isSunday ? '#475569' : 'text.primary',
                        fontWeight: isToday || isHoliday || isSunday ? 700 : 500,
                        fontSize: '0.85rem'
                      }}
                    >
                      {dayObj.date()}
                    </Box>
                    {isHoliday ? (
                      <Tooltip title={`Holiday: ${holidayName}`}>
                        <Chip
                          label={`🏖️ ${holidayName}`}
                          size='small'
                          sx={{
                            mt: 0.5,
                            maxWidth: '92%',
                            height: 16,
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            bgcolor: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }
                          }}
                        />
                      </Tooltip>
                    ) : isSunday ? (
                      <Tooltip title='Sunday (Weekend)'>
                        <Chip
                          label='Weekend'
                          size='small'
                          sx={{
                            mt: 0.5,
                            maxWidth: '92%',
                            height: 18,
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }
                          }}
                        />
                      </Tooltip>
                    ) : null}
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
            const holidayName = holidayMap.get(dateStr)
            const isHoliday = Boolean(holidayName)
            const isSunday = dayObj.day() === 0
            const isNonWorking = isHoliday || isSunday

            const daySchedules = plannedSchedules.filter(s => s.date === dateStr)
            const dayOfWeek = dayObj.day()
            const dayTimetableEntries = !isNonWorking
              ? (facultyTimetable ?? []).filter(
                  entry =>
                    Number(entry.day_of_week) === dayOfWeek &&
                    (entry.subject_id || entry.program_id || entry.subject_name)
                )
              : []

            const missingTimetableSlots = dayTimetableEntries.filter(
              entry => !daySchedules.some(s => s.period_id === entry.period_slot_id)
            )
            const hasMissingTopics = missingTimetableSlots.length > 0

            return (
              <Grid
                item
                xs={12 / 7}
                key={dateStr}
                onClick={() => {
                  if (isNonWorking) {
                    onSelectEmptySlot(dateStr)

                    return
                  }
                  if (!isPast) {
                    onSelectEmptySlot(dateStr)
                  }
                }}
                sx={{
                  minHeight: 120,
                  border: '1px solid',
                  borderColor: isHoliday
                    ? '#fde68a'
                    : isSunday
                      ? '#e2e8f0'
                      : hasMissingTopics && daySchedules.length === 0
                        ? '#fecaca'
                        : '#f5f5f5',
                  p: 1,
                  cursor: isNonWorking ? 'not-allowed' : isPast ? 'not-allowed' : 'pointer',
                  bgcolor: isHoliday
                    ? '#fffdf5'
                    : isSunday
                      ? '#f8fafc'
                      : hasMissingTopics && daySchedules.length === 0
                        ? '#fff8f8'
                        : !isCurrentMonth
                          ? '#fafafa'
                          : '#fff',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: isHoliday
                      ? '#fef9c3'
                      : isSunday
                        ? '#f1f5f9'
                        : hasMissingTopics && daySchedules.length === 0
                          ? '#fee2e2'
                          : isPast
                            ? '#fafafa'
                            : '#f9f9f9'
                  }
                }}
              >
                <Box
                  display='flex'
                  justifyContent={isNonWorking || hasMissingTopics ? 'space-between' : 'center'}
                  alignItems='center'
                  mb={1}
                >
                  <Typography
                    variant='body2'
                    fontWeight={isToday || isHoliday || isSunday ? 700 : 500}
                    sx={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      bgcolor: isToday ? 'primary.main' : isHoliday ? '#fef3c7' : isSunday ? '#f1f5f9' : 'transparent',
                      color: isToday
                        ? '#fff'
                        : isHoliday
                          ? '#b45309'
                          : isSunday
                            ? '#475569'
                            : isCurrentMonth
                              ? 'text.primary'
                              : 'text.disabled'
                    }}
                  >
                    {dayObj.date()}
                  </Typography>
                  {isHoliday ? (
                    <Tooltip title={`Holiday: ${holidayName}`}>
                      <Chip
                        label={`🏖️ ${holidayName}`}
                        size='small'
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          bgcolor: '#fde68a',
                          color: '#92400e',
                          maxWidth: '70%',
                          '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }
                        }}
                      />
                    </Tooltip>
                  ) : isSunday ? (
                    <Tooltip title='Sunday (Weekend)'>
                      <Chip
                        label='Weekend'
                        size='small'
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          bgcolor: '#f1f5f9',
                          color: '#475569',
                          maxWidth: '70%',
                          border: '1px solid #e2e8f0',
                          '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }
                        }}
                      />
                    </Tooltip>
                  ) : hasMissingTopics ? (
                    <Tooltip
                      title={`${missingTimetableSlots.length} timetable class${
                        missingTimetableSlots.length > 1 ? 'es' : ''
                      } need topic scheduled`}
                    >
                      <Chip
                        label={`⚠️ ${missingTimetableSlots.length} need topic`}
                        size='small'
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          bgcolor: '#fee2e2',
                          color: '#b91c1c',
                          maxWidth: '70%',
                          border: '1px solid #fca5a5',
                          '& .MuiChip-label': { px: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }
                        }}
                      />
                    </Tooltip>
                  ) : null}
                </Box>

                <Box display='flex' flexDirection='column' gap={0.5}>
                  {daySchedules.map(s => renderTopicBlock(s))}
                  {isHoliday && daySchedules.length === 0 ? (
                    <Typography
                      variant='caption'
                      sx={{
                        color: '#b45309',
                        fontStyle: 'italic',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        mt: 1,
                        display: 'block'
                      }}
                    >
                      No classes (Holiday)
                    </Typography>
                  ) : isSunday && daySchedules.length === 0 ? (
                    <Typography
                      variant='caption'
                      sx={{
                        color: '#64748b',
                        fontStyle: 'italic',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        mt: 1,
                        display: 'block'
                      }}
                    >
                      Weekend
                    </Typography>
                  ) : hasMissingTopics && daySchedules.length === 0 ? (
                    <Typography
                      variant='caption'
                      sx={{
                        color: '#b91c1c',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        mt: 1,
                        display: 'block'
                      }}
                    >
                      Need topic scheduled ({missingTimetableSlots.length})
                    </Typography>
                  ) : null}
                </Box>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Week Grid (Time Slots) */}
      {viewMode === 'week' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `80px repeat(${days.length}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${periodSlots.length}, minmax(65px, auto))`,
            borderTop: '1px solid #f0f0f0'
          }}
        >
          {/* Time Column (Column 1) */}
          {periodSlots.map((slot, sIndex) => (
            <Box
              key={`time-${slot.id}`}
              sx={{
                gridColumn: 1,
                gridRow: sIndex + 1,
                p: 1,
                borderRight: '1px solid #f0f0f0',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: slot.isBreak ? '#fafafa' : '#fff'
              }}
            >
              <Typography variant='caption' fontWeight={700} color='text.primary'>
                {slot.title}
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                {slot.start_time} - {slot.end_time}
              </Typography>
            </Box>
          ))}

          {/* Day Columns (Columns 2 to 8) */}
          {days.map((dayObj, dIndex) => {
            const col = dIndex + 2
            const dateStr = dayObj.format('YYYY-MM-DD')
            const holidayName = holidayMap.get(dateStr)
            const isHoliday = Boolean(holidayName)
            const isSunday = dayObj.day() === 0
            const isNonWorking = isHoliday || isSunday
            const daySchedules = plannedSchedules.filter(s => s.date === dateStr)

            // If it's a Holiday or Sunday (Weekend), MERGE the entire column across all period slots!
            if (isNonWorking) {
              return (
                <Box
                  key={`merged-${dateStr}`}
                  onClick={() => onSelectEmptySlot(dateStr)}
                  sx={{
                    gridColumn: col,
                    gridRow: `1 / span ${periodSlots.length}`,
                    borderRight: '1px solid #f0f0f0',
                    borderBottom: '1px solid #f0f0f0',
                    p: 2,
                    cursor: 'not-allowed',
                    bgcolor: isHoliday ? '#fffdf5' : '#f8fafc',
                    background: isHoliday
                      ? 'linear-gradient(180deg, #fffdf7 0%, #fffbeb 100%)'
                      : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      filter: 'brightness(0.98)'
                    }
                  }}
                >
                  <Tooltip
                    title={
                      isHoliday ? `Holiday: ${holidayName} (Booking Disabled)` : 'Sunday (Weekend - Booking Disabled)'
                    }
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: '50%',
                          bgcolor: isHoliday ? '#fef3c7' : '#e2e8f0',
                          border: '1px solid',
                          borderColor: isHoliday ? '#fde68a' : '#cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        {isHoliday ? '🏖️' : '☕'}
                      </Box>
                      <Typography
                        variant='subtitle2'
                        fontWeight={700}
                        color={isHoliday ? '#92400e' : '#475569'}
                        textAlign='center'
                        sx={{ maxWidth: 130, wordBreak: 'break-word', fontSize: '0.85rem' }}
                      >
                        {isHoliday ? holidayName : 'Sunday'}
                      </Typography>
                      <Chip
                        label={isHoliday ? 'Holiday • No Classes' : 'Weekend • No Classes'}
                        size='small'
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          bgcolor: isHoliday ? '#fef3c7' : '#e2e8f0',
                          color: isHoliday ? '#b45309' : '#475569',
                          border: '1px solid',
                          borderColor: isHoliday ? '#fde68a' : '#cbd5e1',
                          '& .MuiChip-label': { px: 0.75 }
                        }}
                      />
                    </Box>
                  </Tooltip>

                  {/* If any topics were previously scheduled on this day */}
                  {daySchedules.length > 0 && (
                    <Box display='flex' flexDirection='column' gap={0.5} width='100%' mt={1.5}>
                      {daySchedules.map(s => renderTopicBlock(s))}
                    </Box>
                  )}
                </Box>
              )
            }

            // Normal working day: render each period slot cell individually
            const isPast = dayObj.isBefore(dayjs(), 'day')
            const dayOfWeek = dayObj.day()

            return (
              <React.Fragment key={`day-col-${dateStr}`}>
                {periodSlots.map((slot, sIndex) => {
                  const isBreak = slot.isBreak === 1
                  const slotSchedules = plannedSchedules.filter(
                    sched => sched.date === dateStr && sched.period_id === slot.id
                  )
                  const hasTopicScheduled = slotSchedules.length > 0

                  // Matching timetable entry for this weekday and period
                  const timetableEntries = !isBreak ? timetableMap.get(`${dayOfWeek}_${slot.id}`) || [] : []
                  const hasTimetable =
                    timetableEntries.length > 0 &&
                    timetableEntries.some(entry => entry.program_id || entry.subject_id || entry.subject_name)

                  // User requirement:
                  // "if there is no holiday, not a weekend and had timetable schedule of a period but no topic scheduled,
                  // need to show some kind of indication with pale red color bg stating need topic scheduled"
                  const needsTopicScheduled = !isHoliday && !isSunday && !isBreak && hasTimetable && !hasTopicScheduled

                  const primaryTimetableEntry = timetableEntries[0]

                  return (
                    <Box
                      key={`${dateStr}-${slot.id}`}
                      onClick={() => {
                        if (!isPast && !isBreak) {
                          onSelectEmptySlot(dateStr, slot.id)
                        }
                      }}
                      sx={{
                        gridColumn: col,
                        gridRow: sIndex + 1,
                        minHeight: 68,
                        borderRight: '1px solid',
                        borderBottom: '1px solid',
                        borderColor: needsTopicScheduled ? '#fecaca' : '#f0f0f0',
                        p: 0.75,
                        bgcolor: isBreak
                          ? '#fbfbfb'
                          : needsTopicScheduled
                            ? isPast
                              ? '#fff5f5'
                              : '#fff1f2'
                            : isPast
                              ? '#fafafa'
                              : '#fff',
                        cursor: isBreak || isPast ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: isBreak
                            ? undefined
                            : needsTopicScheduled
                              ? isPast
                                ? '#fee2e2'
                                : '#ffe4e6'
                              : isPast
                                ? undefined
                                : '#f9f9f9'
                        }
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
                      ) : hasTopicScheduled ? (
                        <Box display='flex' flexDirection='column' gap={0.5} height='100%'>
                          {slotSchedules.map(s => renderTopicBlock(s))}
                        </Box>
                      ) : needsTopicScheduled ? (
                        <Tooltip
                          enterDelay={500}
                          arrow
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography
                                variant='caption'
                                fontWeight={700}
                                sx={{ color: '#fff', display: 'block', mb: 0.25 }}
                              >
                                Timetable Schedule
                              </Typography>

                              {primaryTimetableEntry?.program_name && (
                                <Typography
                                  variant='caption'
                                  sx={{ display: 'block', color: 'rgba(255,255,255,0.85)' }}
                                >
                                  Program: {primaryTimetableEntry.program_name}
                                </Typography>
                              )}
                              {primaryTimetableEntry?.segment_name && (
                                <Typography
                                  variant='caption'
                                  sx={{ display: 'block', color: 'rgba(255,255,255,0.85)' }}
                                >
                                  Segment: {primaryTimetableEntry.segment_name}
                                </Typography>
                              )}
                              {primaryTimetableEntry?.medium_name && (
                                <Typography
                                  variant='caption'
                                  sx={{ display: 'block', color: 'rgba(255,255,255,0.85)' }}
                                >
                                  Medium: {primaryTimetableEntry.medium_name}
                                </Typography>
                              )}
                              {primaryTimetableEntry?.subject_name && (
                                <Typography
                                  variant='caption'
                                  sx={{ display: 'block', color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}
                                >
                                  Subject: {primaryTimetableEntry.subject_name}
                                  {primaryTimetableEntry.section_name ? ` (${primaryTimetableEntry.section_name})` : ''}
                                </Typography>
                              )}
                            </Box>
                          }
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%',
                              p: 0.75,
                              borderRadius: 1.5,
                              bgcolor: isPast ? '#fff5f5' : '#fff1f2',
                              border: '1px dashed #f87171',
                              textAlign: 'center',
                              gap: 0.5,
                              transition: 'all 0.15s ease-in-out',
                              '&:hover': {
                                bgcolor: '#fee2e2',
                                borderColor: '#ef4444'
                              }
                            }}
                          >
                            <Box display='flex' alignItems='center' gap={0.5}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: '#ef4444',
                                  flexShrink: 0
                                }}
                              />
                              <Typography
                                variant='caption'
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#b91c1c',
                                  lineHeight: 1.2
                                }}
                              >
                                Need a topic
                              </Typography>
                            </Box>

                            {!isPast ? (
                              <Typography
                                variant='caption'
                                sx={{
                                  fontSize: '0.65rem',
                                  color: '#dc2626',
                                  fontWeight: 600,
                                  lineHeight: 1
                                }}
                              >
                                Click to schedule
                              </Typography>
                            ) : (
                              <Typography
                                variant='caption'
                                sx={{
                                  fontSize: '0.62rem',
                                  color: '#94a3b8',
                                  fontStyle: 'italic',
                                  lineHeight: 1
                                }}
                              >
                                Past slot
                              </Typography>
                            )}
                          </Box>
                        </Tooltip>
                      ) : (
                        <Box display='flex' flexDirection='column' gap={0.5} height='100%'>
                          {/* Empty free period slot */}
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </React.Fragment>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
