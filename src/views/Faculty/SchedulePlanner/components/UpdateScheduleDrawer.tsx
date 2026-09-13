import { Box, Typography, IconButton, TextField, MenuItem, Divider, Drawer } from '@mui/material'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { ChaarvyButton } from 'src/reusable_components'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import { PERIOD_SLOTS, PeriodSlot, PlannedSchedule, SelectedScheduleModalState, HolidayItem } from '../types'

interface UpdateScheduleDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedScheduleForModal: SelectedScheduleModalState | null
  periodSlots?: PeriodSlot[]
  holidays?: HolidayItem[]
  onUpdateSchedule: (scheduleId: string, updates: Partial<PlannedSchedule>) => void
  onRemoveSchedule: (scheduleId: string) => void
  onToggleComplete: (scheduleId: string) => void
}

export const UpdateScheduleDrawer = ({
  isOpen,
  onClose,
  selectedScheduleForModal,
  periodSlots = PERIOD_SLOTS,
  holidays = [],
  onUpdateSchedule,
  onRemoveSchedule,
  onToggleComplete
}: UpdateScheduleDrawerProps) => {
  const holidayMap = useMemo(() => {
    const map = new Map<string, string>()
    ;(holidays ?? []).forEach(h => {
      if (h?.date) {
        map.set(dayjs(h.date).format('YYYY-MM-DD'), h.holiday_name || 'Holiday')
      }
    })

    return map
  }, [holidays])

  if (!selectedScheduleForModal) return null

  const { schedule } = selectedScheduleForModal

  return (
    <Drawer anchor='right' open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: { xs: 320, sm: 420 },
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: '#fff'
        }}
      >
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h6' fontWeight={700} color='text.primary'>
            Schedule Details
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <GetChaarvyIcons iconName={ChaarvyIcon.Close} />
          </IconButton>
        </Box>

        <Typography variant='subtitle1' color='primary' fontWeight={600} mb={1}>
          {schedule.topic_name || 'Scheduled Topic'}
        </Typography>

        {(schedule.program_name || schedule.segment_name || schedule.section_name) && (
          <Typography variant='caption' color='text.secondary' mb={3} display='block'>
            {schedule.program_name || ''} {schedule.segment_name ? `• ${schedule.segment_name}` : ''}
            {schedule.section_name ? ` • ${schedule.section_name}` : ''}
            {schedule.subject_name ? ` • ${schedule.subject_name}` : ''}
          </Typography>
        )}

        <Box display='flex' flexDirection='column' gap={2.5} flex={1} overflow='auto' pr={0.5}>
          {/* Date Picker */}
          <Box>
            <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
              Date
            </Typography>
            <Box sx={{ '.react-datepicker-wrapper': { width: '100%' } }}>
              <DatePicker
                portalId='datepicker-portal'
                minDate={new Date()}
                filterDate={(date: Date) => date.getDay() !== 0 && !holidayMap.has(dayjs(date).format('YYYY-MM-DD'))}
                selected={schedule.date ? new Date(schedule.date) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    onUpdateSchedule(schedule.id, {
                      date: dayjs(date).format('YYYY-MM-DD')
                    })
                  }
                }}
                customInput={<TextField size='small' fullWidth placeholder='Select Date' />}
              />
            </Box>
          </Box>

          {/* Period Slot */}
          <Box>
            <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
              Period
            </Typography>
            <TextField
              select
              fullWidth
              size='small'
              value={schedule.period_id || ''}
              onChange={e => onUpdateSchedule(schedule.id, { period_id: e.target.value })}
            >
              {periodSlots
                .filter(p => p.isBreak === 0)
                .map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title} ({p.start_time} - {p.end_time})
                  </MenuItem>
                ))}
            </TextField>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Topic Status Card */}
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            p={2}
            bgcolor='#fafafa'
            borderRadius={2}
            border='1px solid #f0f0f0'
          >
            <Box>
              <Typography variant='body2' fontWeight={600}>
                Topic Status
              </Typography>
              <Typography variant='caption' color={schedule.completed ? 'success.main' : 'warning.main'}>
                {schedule.completed ? '✓ Completed' : '⏳ Pending'}
              </Typography>
            </Box>
            <ChaarvyButton
              size='small'
              variant={schedule.completed ? 'outlined' : 'contained'}
              color={schedule.completed ? 'primary' : 'success'}
              onClick={() => onToggleComplete(schedule.id)}
            >
              {schedule.completed ? 'Mark Pending' : 'Mark Complete'}
            </ChaarvyButton>
          </Box>
        </Box>

        <Box display='flex' justifyContent='space-between' mt={3} pt={2} borderTop='1px solid #f0f0f0'>
          <ChaarvyButton variant='outlined' color='error' onClick={() => onRemoveSchedule(schedule.id)} size='small'>
            Delete Schedule
          </ChaarvyButton>
          <ChaarvyButton variant='contained' onClick={onClose} size='small' sx={{ px: 3 }}>
            Done
          </ChaarvyButton>
        </Box>
      </Box>
    </Drawer>
  )
}
