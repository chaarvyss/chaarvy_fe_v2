import {
  Box,
  Card,
  Typography,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  MenuItem,
  Divider,
  Drawer
} from '@mui/material'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useState, useMemo } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'

dayjs.extend(isBetween)

import { ChaarvyButton } from 'src/reusable_components'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'
import CoverageProgressBar from 'src/reusable_components/CoverageProgressBar'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import QuestionPaperGenerator from './QuestionPaperGenerator'

// Shared mock data
const CLASSES = [
  { label: 'Class 1', value: 'c1' },
  { label: 'Class 2', value: 'c2' },
  { label: 'Class 3', value: 'c3' },
  { label: 'Class 4', value: 'c4' },
  { label: 'Class 5', value: 'c5' }
]

const SUBJECTS = [
  { label: 'Mathematics', value: 'math' },
  { label: 'Science', value: 'sci' },
  { label: 'English', value: 'eng' }
]

const SEGMENTS = [
  { label: 'Default', value: 'default' },
  { label: 'Special', value: 'special' }
]

const MEDIUMS = [
  { label: 'English', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Telugu', value: 'Telugu' }
]

const SECTIONS = [
  { label: 'Section A', value: 'A' },
  { label: 'Section B', value: 'B' },
  { label: 'Section C', value: 'C' }
]

const MOCK_TOPICS: Record<
  string,
  { id: string; title: string; completed: boolean; classId: string; subjectId: string }[]
> = {
  'c3-math': [
    { id: 't1', title: 'Addition and Subtraction', completed: true, classId: 'c3', subjectId: 'math' },
    { id: 't2', title: 'Multiplication Tables', completed: false, classId: 'c3', subjectId: 'math' }
  ],
  'c5-sci': [
    { id: 't3', title: 'Solar System', completed: false, classId: 'c5', subjectId: 'sci' },
    { id: 't4', title: 'Human Body', completed: false, classId: 'c5', subjectId: 'sci' }
  ]
}

const PERIOD_SLOTS = [
  {
    id: 'da9f9541-82ce-400b-8c99-d6fb97987703',
    start_time: '09:00',
    end_time: '09:45',
    duration: 45,
    isBreak: 0,
    title: 'Period 1'
  },
  {
    id: 'f50cb5bc-efeb-4966-bd38-4a216da9b4eb',
    start_time: '09:45',
    end_time: '10:30',
    duration: 45,
    isBreak: 0,
    title: 'Period 2'
  },
  {
    id: '7df62540-238c-4470-b64c-8722916ea107',
    start_time: '10:30',
    end_time: '11:15',
    duration: 45,
    isBreak: 0,
    title: 'Period 3'
  },
  {
    id: 'dff8ecb5-e18e-4c05-8ea6-680126d74911',
    start_time: '11:15',
    end_time: '11:30',
    duration: 15,
    isBreak: 1,
    title: 'Break'
  },
  {
    id: '0752479f-cdcd-4967-8160-50d607e8b278',
    start_time: '11:30',
    end_time: '12:15',
    duration: 45,
    isBreak: 0,
    title: 'Period 4'
  },
  {
    id: 'ac30dd14-96d8-486b-b685-d7270c70bf59',
    start_time: '12:15',
    end_time: '13:00',
    duration: 45,
    isBreak: 0,
    title: 'Period 5'
  },
  {
    id: 'cec7b755-4a5f-43af-94f0-d2a3a6d11892',
    start_time: '13:00',
    end_time: '13:45',
    duration: 45,
    isBreak: 1,
    title: 'Lunch'
  },
  {
    id: '008b06b1-e5be-4871-80f6-eddbba43bb91',
    start_time: '13:45',
    end_time: '14:30',
    duration: 45,
    isBreak: 0,
    title: 'Period 6'
  },
  {
    id: '2f3e3bd8-1425-4889-9f59-81f79fd3dd08',
    start_time: '14:30',
    end_time: '15:15',
    duration: 45,
    isBreak: 0,
    title: 'Period 7'
  },
  {
    id: '02e25c1b-d925-4026-8e75-2e15a1ec736e',
    start_time: '15:15',
    end_time: '16:00',
    duration: 45,
    isBreak: 0,
    title: 'Period 8'
  }
]

const SchedulePlanner = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [topics, setTopics] = useState(MOCK_TOPICS)
  const [plannedSchedules, setPlannedSchedules] = useState<any[]>([])
  const [showGenerator, setShowGenerator] = useState(false)

  // Calendar State
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Modals state
  const [selectedTopicForModal, setSelectedTopicForModal] = useState<any>(null) // For assigning new schedule
  const [selectedScheduleForModal, setSelectedScheduleForModal] = useState<any>(null) // For editing existing schedule
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<any>(null) // For clicking empty calendar slot

  const currentKey = `${selectedClass}-${selectedSubject}`
  const isGlobalView = !selectedClass && !selectedSubject

  const currentTopics = useMemo(() => {
    if (isGlobalView) return Object.values(topics).flat()
    if (selectedClass && selectedSubject) return topics[currentKey] || []

    return []
  }, [isGlobalView, selectedClass, selectedSubject, currentKey, topics])

  // Get first scheduled date for a topic to act as its "deadline" for legacy features
  const getTopicDeadline = (topicId: string) => {
    const schedules = plannedSchedules.filter(s => s.topic_id === topicId)
    if (schedules.length === 0) return null

    return schedules[0].date
  }

  const updateTopic = (id: string, updates: any) => {
    setTopics(prev => {
      const newTopics = { ...prev }
      for (const key in newTopics) {
        newTopics[key] = newTopics[key].map(t => (t.id === id ? { ...t, ...updates } : t))
      }

      return newTopics
    })

    if (selectedTopicForModal && selectedTopicForModal.id === id) {
      setSelectedTopicForModal({ ...selectedTopicForModal, ...updates })
    }
    if (selectedScheduleForModal && selectedScheduleForModal.topic.id === id) {
      setSelectedScheduleForModal({
        ...selectedScheduleForModal,
        topic: { ...selectedScheduleForModal.topic, ...updates }
      })
    }
  }

  const handleSaveSchedule = (data: any) => {
    const newSchedule = {
      id: `sch_${Date.now()}`,
      period_id: data.period_id,
      date: dayjs(data.date).format('YYYY-MM-DD'),
      subject_id: data.subject_id,
      topic_id: data.topic_id,
      class_id: data.class_id,
      segment: data.segment,
      section: data.section,
      medium: data.medium
    }
    setPlannedSchedules(prev => [...prev, newSchedule])
  }

  const handleUpdateSchedule = (scheduleId: string, updates: any) => {
    setPlannedSchedules(prev => prev.map(s => (s.id === scheduleId ? { ...s, ...updates } : s)))
  }

  const handleRemoveSchedule = (scheduleId: string) => {
    setPlannedSchedules(prev => prev.filter(s => s.id !== scheduleId))
    setSelectedScheduleForModal(null)
  }

  // Coverage Stats
  const totalCount = currentTopics.length
  const completedCount = currentTopics.filter(t => t.completed).length
  const overdueCount = currentTopics.filter(t => {
    if (t.completed) return false
    const deadline = getTopicDeadline(t.id)

    return deadline && dayjs(deadline).isBefore(dayjs(), 'day')
  }).length
  const pendingCount = totalCount - completedCount - overdueCount

  const unscheduledTopics = currentTopics.filter(t => !getTopicDeadline(t.id))

  // Calendar Math
  const start = viewMode === 'month' ? currentDate.startOf('month').startOf('week') : currentDate.startOf('week')
  const end = viewMode === 'month' ? currentDate.endOf('month').endOf('week') : currentDate.endOf('week')

  const days: dayjs.Dayjs[] = []
  let day = start
  while (day.isBefore(end)) {
    days.push(day)
    day = day.add(1, 'day')
  }

  const handlePrev = () => setCurrentDate(currentDate.subtract(1, viewMode))
  const handleNext = () => setCurrentDate(currentDate.add(1, viewMode))
  const handleToday = () => setCurrentDate(dayjs())

  if (showGenerator) {
    const generatorTopics = currentTopics.map(t => ({
      ...t,
      deadline: getTopicDeadline(t.id) ? new Date(getTopicDeadline(t.id)) : null
    }))

    return (
      <QuestionPaperGenerator
        classId={selectedClass}
        subjectId={selectedSubject}
        topics={generatorTopics}
        onBack={() => setShowGenerator(false)}
      />
    )
  }

  const renderTopicBlock = (t: any, schedule: any) => {
    const isOverdue = dayjs(schedule.date).isBefore(dayjs(), 'day')

    return (
      <Tooltip title={t.title} key={schedule.id}>
        <Box
          onClick={e => {
            e.stopPropagation()
            setSelectedScheduleForModal({ topic: t, schedule })
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
            color: t.completed ? '#2e7d32' : isOverdue ? '#c62828' : '#1565c0',
            bgcolor: t.completed ? '#e8f5e9' : isOverdue ? '#ffebee' : '#e3f2fd',
            border: '1px solid',
            borderColor: t.completed ? '#a5d6a7' : isOverdue ? '#ef9a9a' : '#90caf9',
            '&:hover': { filter: 'brightness(0.95)' }
          }}
        >
          {t.title}
        </Box>
      </Tooltip>
    )
  }

  const commonDrawerStyles = {
    width: 400,
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box flex={1}>
          <CoverageProgressBar
            completed={completedCount}
            pending={pendingCount}
            overdue={overdueCount}
            total={totalCount}
          />
        </Box>
        <Box ml={4} display='flex' gap={2}>
          <ChaarvyButton
            variant='contained'
            color='primary'
            disabled={!selectedClass || !selectedSubject || currentTopics.length === 0}
            onClick={() => setShowGenerator(true)}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', height: 40 }}
          >
            Generate Question Paper
          </ChaarvyButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Calendar Area */}
        <Grid item xs={12} md={9}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              height: '100%'
            }}
          >
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
              <Box display='flex' alignItems='center' gap={2}>
                <Typography variant='h5' fontWeight={700}>
                  {viewMode === 'month'
                    ? currentDate.format('MMMM YYYY')
                    : `${currentDate.startOf('week').format('MMM D')} - ${currentDate.endOf('week').format('MMM D, YYYY')}`}
                </Typography>
                {isGlobalView && <Chip size='small' label='Global View' color='secondary' variant='outlined' />}
              </Box>

              <Box display='flex' alignItems='center' gap={2}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, val) => val && setViewMode(val)}
                  size='small'
                >
                  <ToggleButton value='month' sx={{ px: 2, textTransform: 'none' }}>
                    Month
                  </ToggleButton>
                  <ToggleButton value='week' sx={{ px: 2, textTransform: 'none' }}>
                    Week
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box display='flex' gap={1}>
                  <IconButton onClick={handlePrev} size='small' sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <GetChaarvyIcons iconName={ChaarvyIcon.ChevronLeft} />
                  </IconButton>
                  <ChaarvyButton size='small' variant='outlined' onClick={handleToday} sx={{ borderRadius: 2 }}>
                    Today
                  </ChaarvyButton>
                  <IconButton onClick={handleNext} size='small' sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <GetChaarvyIcons iconName={ChaarvyIcon.ChevronRight} />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            <Box>
              {/* Day headers */}
              <Grid container sx={{ borderBottom: '1px solid #f0f0f0', mb: 1, pb: 1, ml: viewMode === 'week' ? 8 : 0 }}>
                {viewMode === 'week' && <Grid item sx={{ width: 80 }} />}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <Grid item xs key={d} sx={{ textAlign: 'center' }}>
                    <Typography variant='subtitle2' color='text.secondary' fontWeight={600}>
                      {d}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

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
                            setSelectedSlotForModal({
                              date: dateStr,
                              period_id: '',
                              class_id: selectedClass || '',
                              segment: 'default',
                              medium: 'English',
                              section: 'A'
                            })
                          }
                        }}
                        sx={{
                          minHeight: 120,
                          border: '1px solid #f5f5f5',
                          p: 1,
                          cursor: isPast ? 'not-allowed' : 'pointer',
                          bgcolor: !isCurrentMonth ? '#fafafa' : '#fff',
                          transition: 'background-color 0.2s',
                          '&:hover': { bgcolor: '#f9f9f9' }
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
                            {dayObj?.date()}
                          </Typography>
                        </Box>

                        <Box display='flex' flexDirection='column' gap={0.5}>
                          {daySchedules.map(s => {
                            const t = currentTopics.find(top => top.id === s.topic_id)

                            return t ? renderTopicBlock(t, s) : null
                          })}
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              )}

              {/* Week Grid (Time Slots) */}
              {viewMode === 'week' && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {PERIOD_SLOTS.map(slot => (
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

                      {/* Days Columns */}
                      {days.map(dayObj => {
                        const dateStr = dayObj.format('YYYY-MM-DD')
                        const isBreak = slot.isBreak === 1
                        const isPast = dayObj.isBefore(dayjs(), 'day')

                        // Topics scheduled in this exact slot
                        const slotSchedules = plannedSchedules.filter(
                          s => s.date === dateStr && s.period_id === slot.id
                        )

                        return (
                          <Box
                            key={`${dateStr}-${slot.id}`}
                            onClick={() => {
                              if (!isBreak && !isPast) {
                                setSelectedSlotForModal({
                                  date: dateStr,
                                  period_id: slot.id,
                                  class_id: selectedClass || '',
                                  segment: 'default',
                                  medium: 'English',
                                  section: 'A'
                                })
                              }
                            }}
                            sx={{
                              flex: 1,
                              p: 0.5,
                              cursor: isBreak ? 'default' : isPast ? 'not-allowed' : 'pointer',
                              borderRight: '1px solid #f5f5f5',
                              bgcolor: isBreak ? 'rgba(0,0,0,0.04)' : '#fff',
                              backgroundImage: isBreak
                                ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.03) 5px, rgba(0,0,0,0.03) 10px)'
                                : 'none'
                            }}
                          >
                            {isBreak ? (
                              <Typography
                                variant='caption'
                                color='text.disabled'
                                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                              >
                                {slot.title}
                              </Typography>
                            ) : (
                              <Box display='flex' flexDirection='column' gap={0.5}>
                                {slotSchedules.map(s => {
                                  const t = currentTopics.find(top => top.id === s.topic_id)

                                  return t ? renderTopicBlock(t, s) : null
                                })}
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
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              height: '100%'
            }}
          >
            <Box mb={3}>
              <Typography variant='subtitle1' fontWeight={700} mb={1}>
                Filters
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <ChaarvySelect
                  label='Class / Program'
                  placeholder='Select Class (Optional)'
                  options={CLASSES}
                  value={selectedClass || ''}
                  onChange={(e: any) => setSelectedClass(e.target.value)}
                />
                <ChaarvySelect
                  label='Subject'
                  placeholder='Select Subject (Optional)'
                  options={SUBJECTS}
                  value={selectedSubject || ''}
                  onChange={(e: any) => setSelectedSubject(e.target.value)}
                />
                <ChaarvyButton
                  variant='outlined'
                  color='secondary'
                  fullWidth
                  onClick={() => {
                    setSelectedClass(null)
                    setSelectedSubject(null)
                  }}
                  disabled={isGlobalView}
                  size='small'
                >
                  Clear Filters (Global View)
                </ChaarvyButton>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant='h6' fontWeight={700} mb={1}>
              Unscheduled Topics
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={2}>
              Click to assign a schedule.
            </Typography>

            <Box display='flex' flexDirection='column' gap={1.5}>
              {unscheduledTopics.length > 0 ? (
                unscheduledTopics.map(t => (
                  <Box
                    key={t.id}
                    onClick={() => {
                      setSelectedTopicForModal({
                        ...t,
                        _tempDate: null,
                        _tempPeriod: '',
                        _tempClassId: t.classId,
                        _tempSegment: 'default',
                        _tempMedium: 'English',
                        _tempSection: 'A'
                      })
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: '#fafafa',
                      border: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Typography variant='subtitle2' fontWeight={600} noWrap>
                      {t.title}
                    </Typography>
                    {isGlobalView && (
                      <Typography variant='caption' color='text.secondary' display='block' mt={0.5}>
                        Class {t.classId.replace('c', '')} • {t.subjectId}
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant='body2' color='text.disabled' align='center' mt={4}>
                  No unscheduled topics.
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* -------------------- DRAWERS -------------------- */}

      {/* Add New Schedule Drawer (triggered from Unscheduled list) */}
      <Drawer anchor='right' open={!!selectedTopicForModal} onClose={() => setSelectedTopicForModal(null)}>
        {selectedTopicForModal && (
          <Box sx={commonDrawerStyles}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6' fontWeight={700}>
                Plan New Schedule
              </Typography>
              <IconButton onClick={() => setSelectedTopicForModal(null)} size='small'>
                <GetChaarvyIcons iconName={ChaarvyIcon.Close} />
              </IconButton>
            </Box>

            <Typography variant='subtitle2' color='primary' mb={3}>
              Topic: {selectedTopicForModal.title}
            </Typography>

            <Box display='flex' flexDirection='column' gap={2} flex={1} overflow='auto'>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Date
                </Typography>
                <Box sx={{ '.react-datepicker-wrapper': { width: '100%' } }}>
                  <DatePicker
                    portalId='datepicker-portal'
                    minDate={new Date()}
                    selected={selectedTopicForModal._tempDate || null}
                    onChange={(date: Date | null) =>
                      setSelectedTopicForModal({ ...selectedTopicForModal, _tempDate: date })
                    }
                    customInput={<TextField size='small' fullWidth placeholder='Select Date' />}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Period
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedTopicForModal._tempPeriod || ''}
                  onChange={e => setSelectedTopicForModal({ ...selectedTopicForModal, _tempPeriod: e.target.value })}
                >
                  {PERIOD_SLOTS.filter(p => p.isBreak === 0).map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title} ({p.start_time} - {p.end_time})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Program / Class
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedTopicForModal._tempClassId || ''}
                  onChange={e => setSelectedTopicForModal({ ...selectedTopicForModal, _tempClassId: e.target.value })}
                >
                  {CLASSES.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Segment
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedTopicForModal._tempSegment || ''}
                  onChange={e => setSelectedTopicForModal({ ...selectedTopicForModal, _tempSegment: e.target.value })}
                >
                  {SEGMENTS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Medium
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedTopicForModal._tempMedium || ''}
                  onChange={e => setSelectedTopicForModal({ ...selectedTopicForModal, _tempMedium: e.target.value })}
                >
                  {MEDIUMS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Section
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedTopicForModal._tempSection || ''}
                  onChange={e => setSelectedTopicForModal({ ...selectedTopicForModal, _tempSection: e.target.value })}
                >
                  {SECTIONS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box display='flex' justifyContent='space-between' mt={3} pt={2} borderTop='1px solid #f0f0f0'>
              <ChaarvyButton variant='outlined' color='warning' onClick={() => setSelectedTopicForModal(null)}>
                Cancel
              </ChaarvyButton>
              <ChaarvyButton
                variant='contained'
                color='primary'
                disabled={
                  !selectedTopicForModal._tempDate ||
                  !selectedTopicForModal._tempPeriod ||
                  !selectedTopicForModal._tempClassId
                }
                onClick={() => {
                  handleSaveSchedule({
                    date: selectedTopicForModal._tempDate,
                    period_id: selectedTopicForModal._tempPeriod,
                    topic_id: selectedTopicForModal.id,
                    subject_id: selectedTopicForModal.subjectId,
                    class_id: selectedTopicForModal._tempClassId,
                    segment: selectedTopicForModal._tempSegment,
                    medium: selectedTopicForModal._tempMedium,
                    section: selectedTopicForModal._tempSection
                  })
                  setSelectedTopicForModal(null)
                }}
              >
                Add Schedule
              </ChaarvyButton>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Edit/Update Existing Schedule Drawer (triggered from Calendar block) */}
      <Drawer anchor='right' open={!!selectedScheduleForModal} onClose={() => setSelectedScheduleForModal(null)}>
        {selectedScheduleForModal && (
          <Box sx={commonDrawerStyles}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6' fontWeight={700}>
                Update Schedule
              </Typography>
              <IconButton onClick={() => setSelectedScheduleForModal(null)} size='small'>
                <GetChaarvyIcons iconName={ChaarvyIcon.Close} />
              </IconButton>
            </Box>

            <Typography variant='subtitle2' color='primary' mb={3}>
              Topic: {selectedScheduleForModal.topic.title}
            </Typography>

            <Box display='flex' flexDirection='column' gap={2} flex={1} overflow='auto'>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Date
                </Typography>
                <Box sx={{ '.react-datepicker-wrapper': { width: '100%' } }}>
                  <DatePicker
                    portalId='datepicker-portal'
                    minDate={new Date()}
                    selected={new Date(selectedScheduleForModal.schedule.date)}
                    onChange={(date: Date | null) => {
                      if (date) {
                        handleUpdateSchedule(selectedScheduleForModal.schedule.id, {
                          date: dayjs(date).format('YYYY-MM-DD')
                        })
                      }
                    }}
                    customInput={<TextField size='small' fullWidth placeholder='Select Date' />}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Period
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedScheduleForModal.schedule.period_id}
                  onChange={e =>
                    handleUpdateSchedule(selectedScheduleForModal.schedule.id, { period_id: e.target.value })
                  }
                >
                  {PERIOD_SLOTS.filter(p => p.isBreak === 0).map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title} ({p.start_time} - {p.end_time})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Program / Class
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedScheduleForModal.schedule.class_id || selectedScheduleForModal.topic.classId}
                  onChange={e =>
                    handleUpdateSchedule(selectedScheduleForModal.schedule.id, { class_id: e.target.value })
                  }
                >
                  {CLASSES.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Segment
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedScheduleForModal.schedule.segment || 'default'}
                  onChange={e =>
                    handleUpdateSchedule(selectedScheduleForModal.schedule.id, { segment: e.target.value })
                  }
                >
                  {SEGMENTS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Medium
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedScheduleForModal.schedule.medium || 'English'}
                  onChange={e => handleUpdateSchedule(selectedScheduleForModal.schedule.id, { medium: e.target.value })}
                >
                  {MEDIUMS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Section
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedScheduleForModal.schedule.section || 'A'}
                  onChange={e =>
                    handleUpdateSchedule(selectedScheduleForModal.schedule.id, { section: e.target.value })
                  }
                >
                  {SECTIONS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box mt={3} pt={2} borderTop='1px solid #f0f0f0'>
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                p={1.5}
                bgcolor='#fafafa'
                borderRadius={2}
                border='1px solid #f0f0f0'
                mb={3}
              >
                <Typography variant='body2' fontWeight={600}>
                  Topic Status
                </Typography>
                <ChaarvyButton
                  size='small'
                  variant={selectedScheduleForModal.topic.completed ? 'outlined' : 'contained'}
                  color={selectedScheduleForModal.topic.completed ? 'primary' : 'success'}
                  onClick={() =>
                    updateTopic(selectedScheduleForModal.topic.id, {
                      completed: !selectedScheduleForModal.topic.completed
                    })
                  }
                >
                  {selectedScheduleForModal.topic.completed ? 'Mark Pending' : 'Mark Complete'}
                </ChaarvyButton>
              </Box>

              <Box display='flex' justifyContent='space-between'>
                <ChaarvyButton
                  variant='outlined'
                  color='error'
                  onClick={() => handleRemoveSchedule(selectedScheduleForModal.schedule.id)}
                >
                  Delete
                </ChaarvyButton>
                <ChaarvyButton variant='contained' onClick={() => setSelectedScheduleForModal(null)}>
                  Done
                </ChaarvyButton>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Schedule Topic from Empty Slot Drawer */}
      <Drawer anchor='right' open={!!selectedSlotForModal} onClose={() => setSelectedSlotForModal(null)}>
        {selectedSlotForModal && (
          <Box sx={commonDrawerStyles}>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='h6' fontWeight={700}>
                Plan New Schedule
              </Typography>
              <IconButton onClick={() => setSelectedSlotForModal(null)} size='small'>
                <GetChaarvyIcons iconName={ChaarvyIcon.Close} />
              </IconButton>
            </Box>

            <Typography variant='body2' color='text.secondary' mb={3}>
              Scheduling for {dayjs(selectedSlotForModal.date).format('MMMM D, YYYY')}.
            </Typography>

            <Box display='flex' flexDirection='column' gap={2} flex={1} overflow='auto'>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Date
                </Typography>
                <Box sx={{ '.react-datepicker-wrapper': { width: '100%' } }}>
                  <DatePicker
                    portalId='datepicker-portal'
                    minDate={new Date()}
                    selected={selectedSlotForModal.date ? new Date(selectedSlotForModal.date) : null}
                    onChange={(date: Date | null) =>
                      setSelectedSlotForModal({
                        ...selectedSlotForModal,
                        date: date ? dayjs(date).format('YYYY-MM-DD') : ''
                      })
                    }
                    customInput={<TextField size='small' fullWidth placeholder='Select Date' />}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Period
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedSlotForModal.period_id || ''}
                  onChange={e => setSelectedSlotForModal({ ...selectedSlotForModal, period_id: e.target.value })}
                >
                  {PERIOD_SLOTS.filter(p => p.isBreak === 0).map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title} ({p.start_time} - {p.end_time})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Select Topic
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedSlotForModal.topic_id || ''}
                  onChange={e => {
                    const topicId = e.target.value
                    const topicObj = currentTopics.find(t => t.id === topicId)
                    if (topicObj) {
                      setSelectedSlotForModal({
                        ...selectedSlotForModal,
                        topic_id: topicId,
                        class_id: topicObj.classId
                      })
                    }
                  }}
                >
                  {currentTopics
                    .filter(t => !t.completed)
                    .map(t => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.title}
                      </MenuItem>
                    ))}
                </TextField>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Program / Class
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedSlotForModal.class_id || ''}
                  onChange={e => setSelectedSlotForModal({ ...selectedSlotForModal, class_id: e.target.value })}
                >
                  {CLASSES.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Segment
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedSlotForModal.segment || 'default'}
                  onChange={e => setSelectedSlotForModal({ ...selectedSlotForModal, segment: e.target.value })}
                >
                  {SEGMENTS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Medium
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedSlotForModal.medium || 'English'}
                  onChange={e => setSelectedSlotForModal({ ...selectedSlotForModal, medium: e.target.value })}
                >
                  {MEDIUMS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
                  Section
                </Typography>
                <TextField
                  select
                  fullWidth
                  size='small'
                  value={selectedSlotForModal.section || 'A'}
                  onChange={e => setSelectedSlotForModal({ ...selectedSlotForModal, section: e.target.value })}
                >
                  {SECTIONS.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box display='flex' justifyContent='space-between' mt={3} pt={2} borderTop='1px solid #f0f0f0'>
              <ChaarvyButton variant='outlined' color='warning' onClick={() => setSelectedSlotForModal(null)}>
                Cancel
              </ChaarvyButton>
              <ChaarvyButton
                variant='contained'
                color='primary'
                disabled={
                  !selectedSlotForModal.topic_id || !selectedSlotForModal.period_id || !selectedSlotForModal.class_id
                }
                onClick={() => {
                  const topic = currentTopics.find(t => t.id === selectedSlotForModal.topic_id)
                  if (topic) {
                    handleSaveSchedule({
                      date: selectedSlotForModal.date,
                      period_id: selectedSlotForModal.period_id,
                      topic_id: topic.id,
                      subject_id: topic.subjectId,
                      class_id: selectedSlotForModal.class_id,
                      segment: selectedSlotForModal.segment,
                      medium: selectedSlotForModal.medium,
                      section: selectedSlotForModal.section
                    })
                    setSelectedSlotForModal(null)
                  }
                }}
              >
                Add Schedule
              </ChaarvyButton>
            </Box>
          </Box>
        )}
      </Drawer>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  )
}

export default SchedulePlanner
