import {
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Drawer,
  CircularProgress,
  Autocomplete,
  Chip
} from '@mui/material'
import dayjs from 'dayjs'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { ChaarvyButton } from 'src/reusable_components'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import { PERIOD_SLOTS, PeriodSlot, SlotModalState } from '../types'

interface PlanScheduleDrawerProps {
  isOpen: boolean
  onClose: () => void
  slotModalState: SlotModalState | null
  setSlotModalField: (key: keyof SlotModalState, value: string) => void
  programOptions: { label: string; value: string }[]
  segmentOptions: { label: string; value: string }[]
  subjectOptions: { label: string; value: string }[]
  mediumOptions: { label: string; value: string }[]
  topicOptions: { label: string; value: string; total_questions?: number; description?: string }[]
  topicSearchText?: string
  setTopicSearchText?: (text: string) => void
  isAutoFilledFromTimetable?: boolean
  sectionOptions?: { label: string; value: string }[]
  periodSlots?: PeriodSlot[]
  isFetchingProgramSegments?: boolean
  isFetchingSubjects?: boolean
  isFetchingTopics?: boolean
  isFetchingMediums?: boolean
  isFetchingSections?: boolean
  isFetchingPeriodSlots?: boolean
  isSaving?: boolean
  onSaveSchedule: (data: {
    date: string
    period_id: string
    program_id: string
    segment_id: string
    subject_id?: string
    topic_id: string
    medium_id?: string
    section_id?: string
  }) => void
}

export const PlanScheduleDrawer = ({
  isOpen,
  onClose,
  slotModalState,
  setSlotModalField,
  programOptions,
  segmentOptions,
  subjectOptions,
  mediumOptions,
  topicOptions,
  topicSearchText = '',
  setTopicSearchText,
  isAutoFilledFromTimetable = false,
  sectionOptions = [],
  periodSlots = PERIOD_SLOTS,
  isFetchingSubjects = false,
  isFetchingTopics = false,
  isFetchingMediums = false,
  isFetchingSections = false,
  isFetchingPeriodSlots = false,
  isSaving = false,
  onSaveSchedule
}: PlanScheduleDrawerProps) => {
  if (!slotModalState) return null

  const isFormValid = Boolean(
    slotModalState.date &&
    slotModalState.period_id &&
    slotModalState.program_id &&
    slotModalState.segment_id &&
    slotModalState.subject_id &&
    slotModalState.topic_id &&
    slotModalState.medium_id &&
    slotModalState.section_id
  )

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
            Plan New Schedule
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <GetChaarvyIcons iconName={ChaarvyIcon.Close} />
          </IconButton>
        </Box>

        <Typography variant='body2' color='text.secondary' mb={isAutoFilledFromTimetable ? 1.5 : 3}>
          {slotModalState.date
            ? `Scheduling for ${dayjs(slotModalState.date).format('MMMM D, YYYY')}.`
            : 'Select date and program to schedule a topic.'}
        </Typography>

        {isAutoFilledFromTimetable && (
          <Box mb={2.5}>
            <Chip
              size='small'
              label='Pre-filled from your Timetable (Editable)'
              color='primary'
              variant='outlined'
              sx={{ fontSize: '0.75rem', fontWeight: 600 }}
            />
          </Box>
        )}

        <Box display='flex' flexDirection='column' gap={2.5} flex={1} overflow='auto' pr={0.5}>
          {/* Date Picker */}
          <Box>
            <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
              Date *
            </Typography>
            <Box sx={{ '.react-datepicker-wrapper': { width: '100%' } }}>
              <DatePicker
                portalId='datepicker-portal'
                minDate={new Date()}
                selected={slotModalState.date ? new Date(slotModalState.date) : null}
                onChange={(date: Date | null) =>
                  setSlotModalField('date', date ? dayjs(date).format('YYYY-MM-DD') : '')
                }
                customInput={<TextField size='small' fullWidth placeholder='Select Date' />}
              />
            </Box>
          </Box>

          {/* Period Slot */}
          <Box>
            <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
              Period *
            </Typography>
            <TextField
              select
              fullWidth
              size='small'
              value={slotModalState.period_id || ''}
              onChange={e => setSlotModalField('period_id', e.target.value)}
              disabled={isFetchingPeriodSlots}
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

          {/* Program */}
          <Box>
            <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
              Program *
            </Typography>
            <TextField
              select
              fullWidth
              size='small'
              value={slotModalState.program_id || ''}
              onChange={e => setSlotModalField('program_id', e.target.value)}
            >
              {programOptions.map(p => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Segment */}
          <Box>
            <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
              Segment *
            </Typography>
            <TextField
              select
              fullWidth
              size='small'
              disabled={!slotModalState.program_id}
              value={slotModalState.segment_id || ''}
              onChange={e => setSlotModalField('segment_id', e.target.value)}
              helperText={!slotModalState.program_id ? 'Select Program first' : ''}
            >
              {segmentOptions.map(s => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Subject (Mandatory) */}
          <Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={0.5}>
              <Typography variant='caption' color='text.secondary' fontWeight={600} display='block'>
                Subject *
              </Typography>
              {isFetchingSubjects && <CircularProgress size={14} />}
            </Box>
            <TextField
              select
              fullWidth
              size='small'
              disabled={!slotModalState.program_id || !slotModalState.segment_id || isFetchingSubjects}
              value={slotModalState.subject_id || ''}
              onChange={e => setSlotModalField('subject_id', e.target.value)}
              helperText={
                !slotModalState.program_id || !slotModalState.segment_id
                  ? 'Select Program and Segment first'
                  : subjectOptions.length === 0 && !isFetchingSubjects
                    ? 'No subjects found for this selection'
                    : ''
              }
            >
              {subjectOptions.map(sub => (
                <MenuItem key={sub.value} value={sub.value}>
                  {sub.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Medium (Mandatory) */}
          <Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={0.5}>
              <Typography variant='caption' color='text.secondary' fontWeight={600} display='block'>
                Medium *
              </Typography>
              {isFetchingMediums && <CircularProgress size={14} />}
            </Box>
            <TextField
              select
              fullWidth
              size='small'
              disabled={!slotModalState.program_id || !slotModalState.segment_id || isFetchingMediums}
              value={slotModalState.medium_id || ''}
              onChange={e => setSlotModalField('medium_id', e.target.value)}
              helperText={
                !slotModalState.program_id || !slotModalState.segment_id
                  ? 'Select Program and Segment first'
                  : mediumOptions.length === 0 && !isFetchingMediums
                    ? 'No mediums found for this selection'
                    : ''
              }
            >
              {mediumOptions.map(m => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Section (Mandatory) */}
          <Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={0.5}>
              <Typography variant='caption' color='text.secondary' fontWeight={600} display='block'>
                Section *
              </Typography>
              {isFetchingSections && <CircularProgress size={14} />}
            </Box>
            <TextField
              select
              fullWidth
              size='small'
              disabled={!slotModalState.medium_id || isFetchingSections}
              value={slotModalState.section_id || ''}
              onChange={e => setSlotModalField('section_id', e.target.value)}
              helperText={
                !slotModalState.medium_id
                  ? 'Select Medium first'
                  : sectionOptions.length === 0 && !isFetchingSections
                    ? 'No sections found for this selection'
                    : ''
              }
            >
              {sectionOptions.map(sec => (
                <MenuItem key={sec.value} value={sec.value}>
                  {sec.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Topic (Searchable with 500ms debounce, fetched dynamically based on Program, Segment & Subject) */}
          <Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={0.5}>
              <Typography variant='caption' color='text.secondary' fontWeight={600} display='block'>
                Topic *
              </Typography>
              {isFetchingTopics && <CircularProgress size={14} />}
            </Box>
            <Autocomplete
              size='small'
              disabled={!slotModalState.subject_id}
              loading={isFetchingTopics}
              options={topicOptions}
              getOptionLabel={opt => (typeof opt === 'string' ? opt : opt.label || '')}
              isOptionEqualToValue={(opt, val) => opt.value === val.value}
              value={topicOptions.find(t => t.value === slotModalState.topic_id) || null}
              onChange={(_, newVal) => {
                setSlotModalField('topic_id', newVal ? newVal.value : '')
              }}
              inputValue={topicSearchText}
              onInputChange={(_, newInputValue) => {
                if (setTopicSearchText) {
                  setTopicSearchText(newInputValue)
                }
              }}
              noOptionsText={
                !slotModalState.subject_id
                  ? 'Select Subject to view topics'
                  : isFetchingTopics
                    ? 'Searching topics...'
                    : 'No topics found'
              }
              renderOption={(props, option) => (
                <Box component='li' {...props} key={option.value}>
                  <Box display='flex' flexDirection='column' width='100%'>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Typography variant='body2' fontWeight={500}>
                        {option.label}
                      </Typography>
                      {option.total_questions !== undefined && option.total_questions > 0 && (
                        <Typography variant='caption' color='text.secondary' sx={{ ml: 1 }}>
                          ({option.total_questions} Qs)
                        </Typography>
                      )}
                    </Box>
                    {option.description && (
                      <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.72rem' }}>
                        {option.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder={!slotModalState.subject_id ? 'Select Subject first' : 'Search topic name...'}
                  helperText={
                    !slotModalState.program_id || !slotModalState.segment_id
                      ? 'Select Program and Segment first'
                      : !slotModalState.subject_id
                        ? 'Select Subject to view topics'
                        : topicOptions.length === 0 && !isFetchingTopics
                          ? 'No topics found for this subject'
                          : ''
                  }
                />
              )}
            />
          </Box>
        </Box>

        <Box display='flex' justifyContent='space-between' mt={3} pt={2} borderTop='1px solid #f0f0f0'>
          <ChaarvyButton variant='outlined' color='secondary' onClick={onClose} size='small'>
            Cancel
          </ChaarvyButton>
          <ChaarvyButton
            variant='contained'
            color='primary'
            loading={isSaving}
            disabled={!isFormValid || isSaving}
            onClick={() => {
              onSaveSchedule({
                date: slotModalState.date,
                period_id: slotModalState.period_id,
                program_id: slotModalState.program_id,
                segment_id: slotModalState.segment_id,
                subject_id: slotModalState.subject_id || undefined,
                topic_id: slotModalState.topic_id,
                medium_id: slotModalState.medium_id,
                section_id: slotModalState.section_id
              })
            }}
            size='small'
            sx={{ px: 3 }}
          >
            Add Schedule
          </ChaarvyButton>
        </Box>
      </Box>
    </Drawer>
  )
}
