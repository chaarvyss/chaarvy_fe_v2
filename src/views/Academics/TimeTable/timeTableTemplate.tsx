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
import React, { useEffect, useState, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { ChaarvyModal, LoadingSpinner } from 'src/reusable_components'
import { useCreateUpdatePeriodTemplateMutation, useGetPeriodTemplateQuery } from 'src/store/services/adminServices'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

interface TimeSlot {
  id: string
  title: string
  start_time: Dayjs
  end_time: Dayjs
  duration: number
  isBreak: number
}

interface TimeTableTemplaterProps {
  isOpen: boolean
  onClose: () => void
}

const parseTime = (timeStr?: string): Dayjs => {
  if (!timeStr) return dayjs().set('hour', 9).set('minute', 0).set('second', 0)
  const [hours, minutes] = timeStr.split(':').map(Number)

  return dayjs()
    .set('hour', isNaN(hours) ? 9 : hours)
    .set('minute', isNaN(minutes) ? 0 : minutes)
    .set('second', 0)
}

const recalculateDownstream = (slots: TimeSlot[], startIndex: number): TimeSlot[] => {
  const updated = [...slots]
  let currentEnd = updated[startIndex].end_time

  for (let i = startIndex + 1; i < updated.length; i++) {
    updated[i] = { ...updated[i], start_time: currentEnd }
    const duration = updated[i].duration > 0 ? updated[i].duration : 45
    updated[i].end_time = currentEnd.add(duration, 'minute')
    currentEnd = updated[i].end_time
  }

  return updated
}

const SlotRow: React.FC<{
  row: TimeSlot
  index: number
  onUpdate: (index: number, field: keyof TimeSlot, value: any) => void
  onRemove: (index: number) => void
  canRemove: boolean
}> = ({ row, index, onUpdate, onRemove, canRemove }) => {
  const isInvalid = row.duration <= 0

  return (
    <TableRow sx={{ bgcolor: row.isBreak ? 'action.hover' : 'inherit', transition: 'background-color 0.2s' }}>
      <TableCell align='center'>
        <Typography variant='body2' color='text.secondary' fontWeight='600'>
          {index + 1}
        </Typography>
      </TableCell>
      <TableCell>
        <TextField
          size='small'
          fullWidth
          value={row.title}
          onChange={e => onUpdate(index, 'title', e.target.value)}
          variant='outlined'
          placeholder='e.g. Period 1 / Lunch'
        />
      </TableCell>
      <TableCell>
        <TimePicker
          value={row.start_time}
          onChange={val => val && onUpdate(index, 'start_time', val)}
          disabled={index > 0}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size='small'
          type='number'
          fullWidth
          value={row.duration}
          onChange={e => onUpdate(index, 'duration', e.target.value)}
          error={isInvalid}
          helperText={isInvalid ? '> 0 mins' : ''}
          InputProps={{
            endAdornment: <InputAdornment position='end'>mins</InputAdornment>,
            inputProps: { min: 1, step: 5 }
          }}
        />
      </TableCell>
      <TableCell>
        <TimePicker
          value={row.end_time}
          onChange={val => val && onUpdate(index, 'end_time', val)}
          minTime={row.start_time}
          slotProps={{ textField: { size: 'small', fullWidth: true, error: isInvalid } }}
        />
      </TableCell>
      <TableCell align='center'>
        <Tooltip title={row.isBreak ? 'Mark as Class' : 'Mark as Break'}>
          <FormControlLabel
            control={
              <Switch
                checked={row.isBreak === 1}
                onChange={e => onUpdate(index, 'isBreak', e.target.checked ? 1 : 0)}
                color='warning'
                size='small'
              />
            }
            label=''
            sx={{ m: 0 }}
          />
        </Tooltip>
      </TableCell>
      <TableCell align='center'>
        <IconButton size='small' color='error' onClick={() => onRemove(index)} disabled={!canRemove}>
          <GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.DeleteOutline} />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

const TimeTableTemplater: React.FC<TimeTableTemplaterProps> = ({ onClose, isOpen }) => {
  const [dayStartTime, setDayStartTime] = useState<Dayjs>(dayjs().set('hour', 9).set('minute', 0).set('second', 0))
  const [dayEndTime, setDayEndTime] = useState<Dayjs>(dayjs().set('hour', 16).set('minute', 0).set('second', 0))
  const [defaultDuration, setDefaultDuration] = useState<number>(45)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [initialStateHash, setInitialStateHash] = useState<string>('')

  const { data: fetchedTemplateData, isLoading: isFetchingTemplate } = useGetPeriodTemplateQuery()
  const [createUpdatePeriodTemplate] = useCreateUpdatePeriodTemplateMutation()

  const currentPayloadObj = useMemo(() => {
    const initialIDs = fetchedTemplateData?.slots?.map(s => s.id) || []
    const currentIDs = new Set(slots.map(s => s.id))
    const deletedSlotIds = initialIDs.filter(id => !currentIDs.has(id))

    const details = slots.map((s, index) => ({
      id: s.id,
      title: s.title,
      start_time: s.start_time.format('HH:mm'),
      end_time: s.end_time.format('HH:mm'),
      duration: s.duration,
      isBreak: s.isBreak ? 1 : 0,
      sequence: index + 1
    }))

    return { details, deleted_ids: deletedSlotIds }
  }, [slots, fetchedTemplateData])

  const hasChanges = useMemo(() => {
    if (!initialStateHash) return true

    return JSON.stringify(currentPayloadObj) !== initialStateHash
  }, [currentPayloadObj, initialStateHash])

  useEffect(() => {
    if (fetchedTemplateData) {
      if (fetchedTemplateData.dayStartTime) setDayStartTime(parseTime(fetchedTemplateData.dayStartTime))
      if (fetchedTemplateData.dayEndTime) setDayEndTime(parseTime(fetchedTemplateData.dayEndTime))
      if (fetchedTemplateData.defaultDuration) setDefaultDuration(fetchedTemplateData.defaultDuration)

      if (fetchedTemplateData.slots && fetchedTemplateData.slots.length > 0) {
        const parsedSlots: TimeSlot[] = fetchedTemplateData.slots.map(s => ({
          ...s,
          start_time: parseTime(s.start_time),
          end_time: parseTime(s.end_time)
        }))
        setSlots(parsedSlots)

        const basePayload = parsedSlots.map((s, i) => ({
          id: s.id,
          title: s.title,
          start_time: s.start_time.format('HH:mm'),
          end_time: s.end_time.format('HH:mm'),
          duration: s.duration,
          is_break: s.isBreak ? 1 : 0,
          sequence: i + 1
        }))
        setInitialStateHash(JSON.stringify({ details: basePayload, deleted_ids: [] }))
      }
    } else {
      const defaultStart = dayjs().set('hour', 9).set('minute', 0).set('second', 0)
      setSlots([
        {
          id: '1',
          title: 'Period 1',
          start_time: defaultStart,
          end_time: defaultStart.add(defaultDuration, 'minute'),
          duration: defaultDuration,
          isBreak: 0
        }
      ])
      setInitialStateHash('')
    }
  }, [fetchedTemplateData])

  const handleDayStartTimeChange = (newStart: Dayjs | null) => {
    if (!newStart) return
    setDayStartTime(newStart)

    if (slots.length > 0) {
      const updated = [...slots]
      updated[0] = {
        ...updated[0],
        start_time: newStart,
        end_time: newStart.add(updated[0].duration, 'minute')
      }
      setSlots(recalculateDownstream(updated, 0))
    }
  }

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
            id: uuidv4(),
            title: `Period ${periodIndex}`,
            start_time: currentStart,
            end_time: dayEndTime,
            duration: remainingMins,
            isBreak: 0
          })
        }
        break
      } else {
        generatedSlots.push({
          id: uuidv4(),
          title: `Period ${periodIndex}`,
          start_time: currentStart,
          end_time: nextEnd,
          duration: defaultDuration,
          isBreak: 0
        })
        currentStart = nextEnd
        periodIndex++
      }
    }

    if (generatedSlots.length > 0) setSlots(generatedSlots)
  }

  const handleGlobalDurationChange = (newDurationStr: string) => {
    const newDuration = parseInt(newDurationStr, 10) || 0
    setDefaultDuration(newDuration)

    if (newDuration <= 0) return

    let updated = [...slots]
    let firstChangedIndex = -1

    updated = updated.map((slot, idx) => {
      if (slot.isBreak === 0) {
        if (firstChangedIndex === -1) firstChangedIndex = idx

        return {
          ...slot,
          duration: newDuration,
          end_time: slot.start_time.add(newDuration, 'minute')
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
      updated[index] = { ...updated[index], duration: numericDuration }
      if (updated[index].start_time && numericDuration > 0) {
        updated[index].end_time = updated[index].start_time.add(numericDuration, 'minute')
      }
      updated = recalculateDownstream(updated, index)
    } else if (field === 'end_time') {
      updated[index] = { ...updated[index], end_time: value as Dayjs }
      if (value && updated[index].start_time) {
        const diffMins = (value as Dayjs).diff(updated[index].start_time, 'minute')
        updated[index].duration = diffMins > 0 ? diffMins : 0
      }
      updated = recalculateDownstream(updated, index)
    } else if (field === 'start_time') {
      updated[index] = { ...updated[index], start_time: value as Dayjs }
      if (value && updated[index].duration > 0) {
        updated[index].end_time = (value as Dayjs).add(updated[index].duration, 'minute')
      }
      updated = recalculateDownstream(updated, index)
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }

    setSlots(updated)
  }

  const handleAddSlot = (isBreak = false) => {
    const lastSlot = slots[slots.length - 1]
    const defaultStart = lastSlot
      ? lastSlot.end_time
      : dayStartTime || dayjs().set('hour', 9).set('minute', 0).set('second', 0)
    const slotDuration = isBreak ? 15 : defaultDuration > 0 ? defaultDuration : 45
    const defaultEnd = defaultStart.add(slotDuration, 'minute')
    const periodCount = slots.filter(s => !s.isBreak).length + 1

    setSlots([
      ...slots,
      {
        id: Date.now().toString(),
        title: isBreak ? 'Break' : `Period ${periodCount}`,
        start_time: defaultStart,
        end_time: defaultEnd,
        duration: slotDuration,
        isBreak: isBreak ? 1 : 0
      }
    ])
  }

  const handleRemoveSlot = (index: number) => {
    const updated = slots.filter((_, i) => i !== index)

    if (updated.length > 0 && index < updated.length) {
      if (index === 0) {
        setSlots(recalculateDownstream(updated, 0))

        return
      } else {
        updated[index] = {
          ...updated[index],
          start_time: updated[index - 1].end_time,
          end_time: updated[index - 1].end_time.add(updated[index].duration, 'minute')
        }
        setSlots(recalculateDownstream(updated, index))

        return
      }
    }

    setSlots(updated)
  }

  const handleSave = () => {
    createUpdatePeriodTemplate(currentPayloadObj)
      .unwrap()
      .then(() => {
        setSlots([])
        onClose()
      })
      .catch(console.error)
  }

  const totalSchoolMinutes = dayStartTime && dayEndTime ? dayEndTime.diff(dayStartTime, 'minute') : 0
  const activeSlotsEnd = slots.length > 0 ? slots[slots.length - 1].end_time : null
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
          <Paper
            variant='outlined'
            sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: 'primary.50', borderColor: 'primary.100' }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={3}
                alignItems={{ xs: 'stretch', md: 'center' }}
                justifyContent='space-between'
              >
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

                {!fetchedTemplateData && (
                  <Button
                    variant='contained'
                    color='primary'
                    sx={{ textTransform: 'none', height: 40 }}
                    startIcon={<GetChaarvyIcons fontSize='1.25rem' iconName={ChaarvyIcon.Refresh} />}
                    onClick={handleAutoGenerateSchedule}
                  >
                    Auto-Generate Slots
                  </Button>
                )}
              </Stack>

              <Divider />

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

              {isFetchingTemplate ? (
                <LoadingSpinner />
              ) : (
                <TableBody>
                  {slots.map((row, index) => (
                    <SlotRow
                      key={row.id}
                      row={row}
                      index={index}
                      onUpdate={updateSlotField}
                      onRemove={handleRemoveSlot}
                      canRemove={slots.length > 1}
                    />
                  ))}
                </TableBody>
              )}
            </Table>
          </TableContainer>

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
              {hasChanges && (
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
              )}
            </Stack>
          </Stack>
        </LocalizationProvider>
      </Box>
    </ChaarvyModal>
  )
}

export default TimeTableTemplater
