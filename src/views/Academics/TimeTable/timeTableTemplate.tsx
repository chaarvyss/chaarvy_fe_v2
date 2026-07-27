import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Stack,
  InputAdornment,
  Divider
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'

import { ChaarvyModal } from 'src/reusable_components'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

interface TimeSlot {
  id: string
  title: string
  startTime: Dayjs
  endTime: Dayjs
  duration: number
  isBreak: boolean
}

// Incoming API Payload Interface (with raw time strings)
interface IncomingTemplateData {
  dayStartTime?: string // e.g., '09:00'
  dayEndTime?: string // e.g., '16:00'
  defaultDuration?: number
  slots?: {
    id: string
    title: string
    startTime: string // e.g., '09:00'
    endTime: string // e.g., '09:45'
    duration: number
    isBreak: boolean
  }[]
}

// Helper to convert time strings ("09:00" or "09:00:00") into a Dayjs object on today's date
const parseTimeString = (timeStr?: string): Dayjs => {
  if (!timeStr) return dayjs().set('hour', 9).set('minute', 0).set('second', 0)

  const [hours, minutes] = timeStr.split(':').map(Number)

  return dayjs()
    .set('hour', isNaN(hours) ? 9 : hours)
    .set('minute', isNaN(minutes) ? 0 : minutes)
    .set('second', 0)
}

interface TimeTableTemplaterProps {
  isOpen: boolean
  onClose: () => void
  initialData?: IncomingTemplateData
}

const TimeTableTemplater: React.FC<TimeTableTemplaterProps> = ({ initialData, onClose, isOpen }) => {
  // Global Schedule Boundaries
  const [dayStartTime, setDayStartTime] = useState<Dayjs>(dayjs().set('hour', 9).set('minute', 0).set('second', 0))
  const [dayEndTime, setDayEndTime] = useState<Dayjs>(dayjs().set('hour', 16).set('minute', 0).set('second', 0))
  const [defaultDuration, setDefaultDuration] = useState<number>(45)

  const [slots, setSlots] = useState<TimeSlot[]>([])

  // Convert incoming string-based past data into Dayjs state when initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.dayStartTime) {
        setDayStartTime(parseTimeString(initialData.dayStartTime))
      }
      if (initialData.dayEndTime) {
        setDayEndTime(parseTimeString(initialData.dayEndTime))
      }
      if (initialData.defaultDuration) {
        setDefaultDuration(initialData.defaultDuration)
      }

      if (initialData.slots && initialData.slots.length > 0) {
        const parsedSlots: TimeSlot[] = initialData.slots.map(s => ({
          ...s,
          startTime: parseTimeString(s.startTime),
          endTime: parseTimeString(s.endTime)
        }))
        setSlots(parsedSlots)
      }
    } else {
      // Default fallback state if no past data is provided
      const defaultStart = dayjs().set('hour', 9).set('minute', 0).set('second', 0)
      setSlots([
        {
          id: '1',
          title: 'Period 1',
          startTime: defaultStart,
          endTime: defaultStart.add(defaultDuration, 'minute'),
          duration: defaultDuration,
          isBreak: false
        }
      ])
    }
  }, [initialData])

  // Cascade/ripple timing updates to downstream rows
  const recalculateDownstream = (updatedSlots: TimeSlot[], startIndex: number) => {
    let currentEndTime = updatedSlots[startIndex].endTime

    for (let i = startIndex + 1; i < updatedSlots.length; i++) {
      updatedSlots[i].startTime = currentEndTime
      const duration = updatedSlots[i].duration > 0 ? updatedSlots[i].duration : 45
      updatedSlots[i].endTime = currentEndTime.add(duration, 'minute')
      currentEndTime = updatedSlots[i].endTime
    }

    return updatedSlots
  }

  // Handle Day Start Time change -> updates first slot and ripples rest down
  const handleDayStartTimeChange = (newStart: Dayjs | null) => {
    if (!newStart) return
    setDayStartTime(newStart)

    if (slots.length > 0) {
      let updated = [...slots]
      updated[0].startTime = newStart
      updated[0].endTime = newStart.add(updated[0].duration, 'minute')
      updated = recalculateDownstream(updated, 0)
      setSlots(updated)
    }
  }

  // Auto-generate full schedule from Start Time to End Time using Default Duration
  const handleAutoGenerateSchedule = () => {
    if (!dayStartTime || !dayEndTime || defaultDuration <= 0) return

    let currentStart = dayStartTime
    const generatedSlots: TimeSlot[] = []
    let periodIndex = 1

    while (currentStart.isBefore(dayEndTime)) {
      const nextEnd = currentStart.add(defaultDuration, 'minute')

      if (nextEnd.isAfter(dayEndTime)) {
        const remainingMins = dayEndTime.diff(currentStart, 'minute')
        if (remainingMins > 0) {
          generatedSlots.push({
            id: Date.now().toString() + periodIndex,
            title: `Period ${periodIndex}`,
            startTime: currentStart,
            endTime: dayEndTime,
            duration: remainingMins,
            isBreak: false
          })
        }
        break
      } else {
        generatedSlots.push({
          id: Date.now().toString() + periodIndex,
          title: `Period ${periodIndex}`,
          startTime: currentStart,
          endTime: nextEnd,
          duration: defaultDuration,
          isBreak: false
        })
        currentStart = nextEnd
        periodIndex++
      }
    }

    if (generatedSlots.length > 0) {
      setSlots(generatedSlots)
    }
  }

  // Bulk update non-break class durations when the global default changes
  const handleGlobalDurationChange = (newDurationStr: string) => {
    const newDuration = parseInt(newDurationStr, 10) || 0
    setDefaultDuration(newDuration)

    if (newDuration <= 0) return

    let updated = [...slots]
    let firstChangedIndex = -1

    updated = updated.map((slot, idx) => {
      if (!slot.isBreak) {
        if (firstChangedIndex === -1) firstChangedIndex = idx
        const updatedEndTime = slot.startTime.add(newDuration, 'minute')

        return {
          ...slot,
          duration: newDuration,
          endTime: updatedEndTime
        }
      }

      return slot
    })

    if (firstChangedIndex !== -1) {
      updated = recalculateDownstream(updated, firstChangedIndex)
    }

    setSlots(updated)
  }

  const updateSlotField = (index: number, field: keyof TimeSlot, value: any) => {
    let updated = [...slots]

    if (field === 'duration') {
      const numericDuration = parseInt(value, 10) || 0
      updated[index].duration = numericDuration

      if (updated[index].startTime && numericDuration > 0) {
        updated[index].endTime = updated[index].startTime.add(numericDuration, 'minute')
      }
      updated = recalculateDownstream(updated, index)
    } else if (field === 'endTime') {
      updated[index].endTime = value as Dayjs

      if (value && updated[index].startTime) {
        const diffMins = (value as Dayjs).diff(updated[index].startTime, 'minute')
        updated[index].duration = diffMins > 0 ? diffMins : 0
      }
      updated = recalculateDownstream(updated, index)
    } else if (field === 'startTime') {
      updated[index].startTime = value as Dayjs

      if (value && updated[index].duration > 0) {
        updated[index].endTime = (value as Dayjs).add(updated[index].duration, 'minute')
      }
      updated = recalculateDownstream(updated, index)
    } else {
      ;(updated[index] as any)[field] = value
    }

    setSlots(updated)
  }

  const handleAddSlot = (isBreak = false) => {
    const lastSlot = slots[slots.length - 1]
    const defaultStart = lastSlot
      ? lastSlot.endTime
      : dayStartTime || dayjs().set('hour', 9).set('minute', 0).set('second', 0)

    const slotDuration = isBreak ? 15 : defaultDuration > 0 ? defaultDuration : 45
    const defaultEnd = defaultStart.add(slotDuration, 'minute')

    const periodCount = slots.filter(s => !s.isBreak).length + 1

    setSlots([
      ...slots,
      {
        id: Date.now().toString(),
        title: isBreak ? 'Break' : `Period ${periodCount}`,
        startTime: defaultStart,
        endTime: defaultEnd,
        duration: slotDuration,
        isBreak
      }
    ])
  }

  const handleRemoveSlot = (index: number) => {
    const updated = slots.filter((_, i) => i !== index)

    if (updated.length > 0 && index < updated.length) {
      if (index === 0) {
        recalculateDownstream(updated, 0)
      } else {
        updated[index].startTime = updated[index - 1].endTime
        updated[index].endTime = updated[index].startTime.add(updated[index].duration, 'minute')
        recalculateDownstream(updated, index)
      }
    }

    setSlots(updated)
  }

  // Handle Save logic -> outputs clean HH:mm strings for backend storage
  const handleSave = () => {
    const formattedData = {
      dayStartTime: dayStartTime ? dayStartTime.format('HH:mm') : null,
      dayEndTime: dayEndTime ? dayEndTime.format('HH:mm') : null,
      defaultDuration,
      slots: slots.map(s => ({
        id: s.id,
        title: s.title,
        startTime: s.startTime.format('HH:mm'),
        endTime: s.endTime.format('HH:mm'),
        duration: s.duration,
        isBreak: s.isBreak
      }))
    }

    console.log('Saved Timetable Template:', formattedData)

    // Add your API submit call here (e.g., dispatch(saveTimetableTemplate(formattedData)))
  }

  // Calculate overall day span stats
  const totalSchoolMinutes = dayStartTime && dayEndTime ? dayEndTime.diff(dayStartTime, 'minute') : 0
  const activeSlotsEnd = slots.length > 0 ? slots[slots.length - 1].endTime : null
  const hasInvalidSlots = slots.some(s => s.duration <= 0)

  return (
    <ChaarvyModal
      isOpen={isOpen}
      onClose={onClose}
      modalSize='col-10'
      title={
        <Box
          sx={{
            pb: 2,
            mb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant='h5' fontWeight='700' color='primary.main'>
              Timetable Structure Builder
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Define day timing boundaries, period duration, and break slots.
            </Typography>
          </Box>
        </Box>
      }
    >
      <Box sx={{ p: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Top Controls: Day Start, End & Default Duration */}
          <Paper
            variant='outlined'
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              bgcolor: 'primary.50',
              borderColor: 'primary.100'
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={3}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent='space-between'
              >
                {/* Time Range Pickers */}
                <Stack direction='row' spacing={2} alignItems='center'>
                  <TimePicker
                    label='Day Start Time'
                    value={dayStartTime}
                    onChange={handleDayStartTimeChange}
                    slotProps={{ textField: { size: 'small', sx: { width: 160, bgcolor: 'background.paper' } } }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    to
                  </Typography>
                  <TimePicker
                    label='Day End Time'
                    value={dayEndTime}
                    minTime={dayStartTime}
                    onChange={val => val && setDayEndTime(val)}
                    slotProps={{ textField: { size: 'small', sx: { width: 160, bgcolor: 'background.paper' } } }}
                  />
                </Stack>

                {/* Default Duration Setting */}
                <TextField
                  label='Default Duration'
                  size='small'
                  type='number'
                  value={defaultDuration}
                  onChange={e => handleGlobalDurationChange(e.target.value)}
                  sx={{ width: 170, bgcolor: 'background.paper' }}
                  InputProps={{
                    endAdornment: <InputAdornment position='end'>mins</InputAdornment>,
                    inputProps: { min: 1, step: 5 }
                  }}
                />

                {/* Auto Fill Button */}
                <Button
                  variant='contained'
                  color='primary'
                  sx={{ textTransform: 'none', height: 40 }}
                  startIcon={<GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.Refresh} />}
                  onClick={handleAutoGenerateSchedule}
                >
                  Auto-Generate Slots
                </Button>
              </Stack>

              <Divider />

              {/* Status Bar showing calculated span */}
              <Stack direction='row' spacing={3} justifyContent='space-between'>
                <Typography variant='caption' color='text.secondary'>
                  Total Operating Window:{' '}
                  <strong>
                    {Math.floor(totalSchoolMinutes / 60)} hrs {totalSchoolMinutes % 60} mins
                  </strong>
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Current Slots End At: <strong>{activeSlotsEnd ? activeSlotsEnd.format('hh:mm A') : 'N/A'}</strong>
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Slots Table */}
          <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell width='5%' align='center'>
                    <strong>#</strong>
                  </TableCell>
                  <TableCell width='25%'>
                    <strong>Slot Name</strong>
                  </TableCell>
                  <TableCell width='20%'>
                    <strong>Start Time</strong>
                  </TableCell>
                  <TableCell width='18%'>
                    <strong>Duration</strong>
                  </TableCell>
                  <TableCell width='20%'>
                    <strong>End Time</strong>
                  </TableCell>
                  <TableCell width='7%' align='center'>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell width='5%' align='center'>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map((row, index) => {
                  const isInvalid = row.duration <= 0

                  return (
                    <TableRow
                      key={row.id}
                      sx={{
                        bgcolor: row.isBreak ? 'action.hover' : 'inherit',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {/* Index */}
                      <TableCell align='center'>
                        <Typography variant='body2' color='text.secondary' fontWeight='600'>
                          {index + 1}
                        </Typography>
                      </TableCell>

                      {/* Slot Name Input */}
                      <TableCell>
                        <TextField
                          size='small'
                          fullWidth
                          value={row.title}
                          onChange={e => updateSlotField(index, 'title', e.target.value)}
                          variant='outlined'
                          placeholder='e.g. Period 1 / Lunch'
                        />
                      </TableCell>

                      {/* Start Time Picker */}
                      <TableCell>
                        <TimePicker
                          value={row.startTime}
                          onChange={val => val && updateSlotField(index, 'startTime', val)}
                          disabled={index > 0}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </TableCell>

                      {/* Duration Input */}
                      <TableCell>
                        <TextField
                          size='small'
                          type='number'
                          fullWidth
                          value={row.duration}
                          onChange={e => updateSlotField(index, 'duration', e.target.value)}
                          error={isInvalid}
                          helperText={isInvalid ? '> 0 mins' : ''}
                          InputProps={{
                            endAdornment: <InputAdornment position='end'>mins</InputAdornment>,
                            inputProps: { min: 1, step: 5 }
                          }}
                        />
                      </TableCell>

                      {/* End Time Picker */}
                      <TableCell>
                        <TimePicker
                          value={row.endTime}
                          onChange={val => val && updateSlotField(index, 'endTime', val)}
                          minTime={row.startTime}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: isInvalid
                            }
                          }}
                        />
                      </TableCell>

                      {/* Break Switch */}
                      <TableCell align='center'>
                        <Tooltip title={row.isBreak ? 'Mark as Class' : 'Mark as Break'}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={row.isBreak}
                                onChange={e => updateSlotField(index, 'isBreak', e.target.checked)}
                                color='warning'
                                size='small'
                              />
                            }
                            label=''
                            sx={{ m: 0 }}
                          />
                        </Tooltip>
                      </TableCell>

                      {/* Delete Action */}
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleRemoveSlot(index)}
                          disabled={slots.length <= 1}
                        >
                          <GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.DeleteOutline} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Toolbar */}
          <Stack direction='row' spacing={2} sx={{ mt: 3 }} justifyContent='space-between' alignItems='center'>
            <Stack direction='row' spacing={2}>
              <Button
                sx={{ textTransform: 'none' }}
                variant='contained'
                startIcon={<GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.PlusCircle} />}
                onClick={() => handleAddSlot(false)}
              >
                Add class period
              </Button>
              <Button
                variant='outlined'
                color='warning'
                sx={{ textTransform: 'none' }}
                startIcon={<GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.Nature} />}
                onClick={() => handleAddSlot(true)}
              >
                Add break
              </Button>
            </Stack>

            <Stack direction='row' spacing={3} alignItems='center'>
              <Typography variant='caption' color='text.secondary'>
                Total Slots: {slots.length} | Classes: {slots.filter(s => !s.isBreak).length} | Breaks:{' '}
                {slots.filter(s => s.isBreak).length}
              </Typography>
              <Button
                variant='contained'
                color='success'
                disabled={hasInvalidSlots}
                startIcon={<GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.Check} />}
                onClick={handleSave}
                sx={{ textTransform: 'none' }}
              >
                Save Schedule Template
              </Button>
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Box>
    </ChaarvyModal>
  )
}

export default TimeTableTemplater
