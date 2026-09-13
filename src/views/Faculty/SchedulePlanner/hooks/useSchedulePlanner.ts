import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useState, useMemo } from 'react'

dayjs.extend(isBetween)

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useGetPeriodTemplateQuery } from 'src/store/services/adminServices'
import {
  useGetActiveSegmentMediumsQuery,
  useGetActiveMediumSectionsQuery
} from 'src/store/services/admisissionsService'
import {
  useGetTopicsListQuery,
  useGetTopicSchedulesQuery,
  useCreateUpdateTopicScheduleMutation,
  useDeleteTopicScheduleMutation
} from 'src/store/services/facultyServices'
import {
  useGetAllProgramSegmentsListQuery,
  useGetProgramSegmentSubjectsListQuery
} from 'src/store/services/programServices'

import { PERIOD_SLOTS, PeriodSlot, PlannedSchedule, SlotModalState, SelectedScheduleModalState } from '../types'

export const useSchedulePlanner = () => {
  const { triggerToast } = useToast()

  // Calendar State
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week')
  const [showGenerator, setShowGenerator] = useState(false)

  // DB Queries & Mutations for Topic Schedules
  const { data: dbSchedules = [], isFetching: isFetchingSchedules } = useGetTopicSchedulesQuery()
  const [createUpdateScheduleMutation, { isLoading: isSavingSchedule }] = useCreateUpdateTopicScheduleMutation()
  const [deleteScheduleMutation, { isLoading: isDeletingSchedule }] = useDeleteTopicScheduleMutation()

  // Timetable Period Slots from BE
  const { data: periodTemplateData, isFetching: isFetchingPeriodTemplate } = useGetPeriodTemplateQuery()

  const periodSlots = useMemo<PeriodSlot[]>(() => {
    if (periodTemplateData?.slots && periodTemplateData.slots.length > 0) {
      return periodTemplateData.slots.map((s: any) => ({
        id: s.id,
        start_time: s.start_time,
        end_time: s.end_time,
        duration: s.duration,
        isBreak: s.isBreak,
        title: s.title
      }))
    }

    return PERIOD_SLOTS
  }, [periodTemplateData])

  // Schedules State: derived from database query
  const plannedSchedules = useMemo<PlannedSchedule[]>(() => {
    return (dbSchedules ?? []).map(s => ({
      id: s.id,
      period_id: s.period_id,
      period_title: s.period_title,
      date: s.date,
      program_id: s.program_id,
      program_name: s.program_name,
      segment_id: s.segment_id,
      segment_name: s.segment_name,
      subject_id: s.subject_id,
      subject_name: s.subject_name,
      topic_id: s.topic_id,
      topic_name: s.topic_name,
      medium_id: s.medium_id,
      section_id: s.section_id,
      section_name: s.section_name,
      completed: s.completed ?? s.status === 1
    }))
  }, [dbSchedules])

  // Modal / Drawer States
  const [slotModalState, setSlotModalState] = useState<SlotModalState | null>(null)
  const [selectedScheduleForModal, setSelectedScheduleForModal] = useState<SelectedScheduleModalState | null>(null)

  // ---------------- API Queries ----------------

  // 1. Programs & Segments
  const { data: programSegments, isFetching: isFetchingProgramSegments } = useGetAllProgramSegmentsListQuery()

  const programs = useMemo(() => (programSegments ?? []).filter((item: any) => item?.status !== 0), [programSegments])

  const programOptions = useMemo(
    () =>
      Array.from(
        new Map(
          programs.map((item: any) => [item.program_id, { label: item.program_name, value: item.program_id }])
        ).values()
      ),
    [programs]
  )

  const segmentOptions = useMemo(
    () =>
      Array.from(
        new Map(
          programs
            .filter((item: any) => item.program_id === slotModalState?.program_id)
            .map((item: any) => [item.segment_id, { label: item.segment_name, value: item.segment_id }])
        ).values()
      ),
    [programs, slotModalState?.program_id]
  )

  // 2. Subjects (for selected program & segment in drawer)
  const { data: subjectsResponse, isFetching: isFetchingSubjects } = useGetProgramSegmentSubjectsListQuery(
    {
      program_id: slotModalState?.program_id || '',
      segment_id: slotModalState?.segment_id || ''
    },
    {
      skip: !slotModalState?.program_id || !slotModalState?.segment_id
    }
  )

  const subjectOptions = useMemo(
    () =>
      (subjectsResponse ?? []).map((item: any) => ({
        label: item?.subject_name,
        value: item?.subject_id
      })),
    [subjectsResponse]
  )

  // 3. Mediums (for selected program & segment in drawer)
  const { data: mediumsResponse } = useGetActiveSegmentMediumsQuery(
    {
      program_id: slotModalState?.program_id || '',
      segment_id: slotModalState?.segment_id || ''
    },
    {
      skip: !slotModalState?.program_id || !slotModalState?.segment_id
    }
  )

  const mediumOptions = useMemo(
    () =>
      (mediumsResponse ?? []).map((item: any) => ({
        label: item?.medium_name,
        value: item?.medium_id
      })),
    [mediumsResponse]
  )

  // 4. Topics: Fetched based on selected program and segment!
  const { data: topicsResponse, isFetching: isFetchingTopics } = useGetTopicsListQuery(
    {
      program_id: slotModalState?.program_id || '',
      segment_id: slotModalState?.segment_id || '',
      ...(slotModalState?.subject_id ? { subject_id: slotModalState.subject_id } : {})
    },
    {
      skip: !slotModalState?.program_id || !slotModalState?.segment_id
    }
  )

  const topicOptions = useMemo(
    () =>
      (topicsResponse ?? []).map((item: any) => ({
        label: item?.topic_name,
        value: item?.topic_id,
        total_questions: item?.total_questions,
        description: item?.description
      })),
    [topicsResponse]
  )

  // 5. Sections: Fetched based on selected program, segment, and medium!
  const { data: sectionsResponse, isFetching: isFetchingSections } = useGetActiveMediumSectionsQuery(
    {
      program_id: slotModalState?.program_id || '',
      segment_id: slotModalState?.segment_id || '',
      medium_id: slotModalState?.medium_id || ''
    },
    {
      skip: !slotModalState?.program_id || !slotModalState?.segment_id || !slotModalState?.medium_id
    }
  )

  const sectionOptions = useMemo(
    () =>
      (sectionsResponse ?? []).map((sec: any) => ({
        label: sec?.section_name,
        value: sec?.section_id
      })),
    [sectionsResponse]
  )

  // ---------------- Calendar Math ----------------

  const start = useMemo(() => {
    if (viewMode === 'week') {
      // Sunday of the week containing currentDate
      return currentDate.subtract(currentDate.day(), 'day').startOf('day')
    }

    // Month view: Sunday on or before the 1st of the month
    const monthStart = currentDate.startOf('month')

    return monthStart.subtract(monthStart.day(), 'day').startOf('day')
  }, [currentDate, viewMode])

  const end = useMemo(() => {
    if (viewMode === 'week') {
      // Saturday of the week containing currentDate
      return start.add(6, 'day').endOf('day')
    }

    // Month view: Saturday on or after the last day of the month
    const monthEnd = currentDate.endOf('month')

    return monthEnd.add(6 - monthEnd.day(), 'day').endOf('day')
  }, [currentDate, viewMode, start])

  const days = useMemo(() => {
    const list: dayjs.Dayjs[] = []
    let day = start
    while (day.isBefore(end)) {
      list.push(day)
      day = day.add(1, 'day')
    }

    return list
  }, [start, end])

  const handlePrev = () => setCurrentDate(currentDate.subtract(1, viewMode))
  const handleNext = () => setCurrentDate(currentDate.add(1, viewMode))
  const handleToday = () => setCurrentDate(dayjs())

  // ---------------- Drawer Actions ----------------

  const openSlotModal = (date?: string, periodId?: string) => {
    const defaultPeriodId = periodId || periodSlots.find(p => p.isBreak === 0)?.id || ''
    setSlotModalState({
      date: date || dayjs().format('YYYY-MM-DD'),
      period_id: defaultPeriodId,
      program_id: '',
      segment_id: '',
      subject_id: '',
      topic_id: '',
      medium_id: '',
      section_id: ''
    })
  }

  const closeSlotModal = () => setSlotModalState(null)

  const setSlotModalField = (key: keyof SlotModalState, value: string) => {
    setSlotModalState(prev => {
      if (!prev) return null
      const next = { ...prev, [key]: value }

      // Reset downstream selections when parent selection changes
      if (key === 'program_id') {
        next.segment_id = ''
        next.subject_id = ''
        next.topic_id = ''
        next.medium_id = ''
        next.section_id = ''
      } else if (key === 'segment_id') {
        next.subject_id = ''
        next.topic_id = ''
        next.medium_id = ''
        next.section_id = ''
      } else if (key === 'medium_id') {
        next.section_id = ''
      } else if (key === 'subject_id') {
        next.topic_id = ''
      }

      return next
    })
  }

  const handleSaveSchedule = async (data: {
    date: string
    period_id: string
    program_id: string
    segment_id: string
    subject_id?: string
    topic_id: string
    medium_id?: string
    section_id?: string
  }) => {
    try {
      await createUpdateScheduleMutation({
        date: dayjs(data.date).format('YYYY-MM-DD'),
        period_id: data.period_id,
        program_id: data.program_id,
        segment_id: data.segment_id,
        medium_id: data.medium_id || undefined,
        section_id: data.section_id || undefined,
        topic_id: data.topic_id,
        status: 0
      }).unwrap()

      triggerToast('Schedule planned successfully', { variant: ToastVariants.SUCCESS })
      closeSlotModal()
    } catch (err: any) {
      triggerToast(err?.data?.message || 'Failed to plan schedule', { variant: ToastVariants.ERROR })
    }
  }

  const handleUpdateSchedule = async (scheduleId: string, updates: Partial<PlannedSchedule>) => {
    const existing = plannedSchedules.find(s => s.id === scheduleId)
    if (!existing) return

    if (selectedScheduleForModal && selectedScheduleForModal.schedule.id === scheduleId) {
      setSelectedScheduleForModal({
        schedule: { ...selectedScheduleForModal.schedule, ...updates }
      })
    }

    try {
      await createUpdateScheduleMutation({
        id: scheduleId,
        date: updates.date ? dayjs(updates.date).format('YYYY-MM-DD') : existing.date,
        period_id: updates.period_id ?? existing.period_id,
        program_id: updates.program_id ?? existing.program_id ?? '',
        segment_id: updates.segment_id ?? existing.segment_id ?? '',
        medium_id: updates.medium_id ?? existing.medium_id,
        section_id: updates.section_id ?? existing.section_id,
        topic_id: updates.topic_id ?? existing.topic_id,
        status: updates.completed !== undefined ? (updates.completed ? 1 : 0) : existing.completed ? 1 : 0
      }).unwrap()

      triggerToast('Schedule updated successfully', { variant: ToastVariants.SUCCESS })
    } catch (err: any) {
      triggerToast(err?.data?.message || 'Failed to update schedule', { variant: ToastVariants.ERROR })
    }
  }

  const handleRemoveSchedule = async (scheduleId: string) => {
    try {
      await deleteScheduleMutation({ schedule_id: scheduleId }).unwrap()
      setSelectedScheduleForModal(null)
      triggerToast('Schedule removed', { variant: ToastVariants.INFO })
    } catch (err: any) {
      triggerToast(err?.data?.message || 'Failed to remove schedule', { variant: ToastVariants.ERROR })
    }
  }

  const handleToggleComplete = async (scheduleId: string) => {
    const existing = plannedSchedules.find(s => s.id === scheduleId)
    if (!existing) return
    const nextVal = !existing.completed

    if (selectedScheduleForModal && selectedScheduleForModal.schedule.id === scheduleId) {
      setSelectedScheduleForModal({
        schedule: {
          ...selectedScheduleForModal.schedule,
          completed: nextVal
        }
      })
    }

    try {
      await createUpdateScheduleMutation({
        id: scheduleId,
        date: existing.date,
        period_id: existing.period_id,
        program_id: existing.program_id ?? '',
        segment_id: existing.segment_id ?? '',
        medium_id: existing.medium_id,
        section_id: existing.section_id,
        topic_id: existing.topic_id,
        status: nextVal ? 1 : 0
      }).unwrap()

      triggerToast(nextVal ? 'Topic marked as complete' : 'Topic marked as pending', {
        variant: ToastVariants.SUCCESS
      })
    } catch (err: any) {
      if (selectedScheduleForModal && selectedScheduleForModal.schedule.id === scheduleId) {
        setSelectedScheduleForModal({
          schedule: {
            ...selectedScheduleForModal.schedule,
            completed: existing.completed
          }
        })
      }
      triggerToast(err?.data?.message || 'Failed to update topic status', { variant: ToastVariants.ERROR })
    }
  }

  // ---------------- Coverage Stats ----------------

  const totalCount = plannedSchedules.length
  const completedCount = plannedSchedules.filter(s => s.completed).length
  const overdueCount = plannedSchedules.filter(s => !s.completed && dayjs(s.date).isBefore(dayjs(), 'day')).length
  const pendingCount = totalCount - completedCount - overdueCount

  return {
    calendar: {
      currentDate,
      viewMode,
      setViewMode,
      days,
      periodSlots,
      isFetchingPeriodTemplate,
      handlePrev,
      handleNext,
      handleToday
    },
    schedules: {
      plannedSchedules,
      isFetchingSchedules,
      isSavingSchedule,
      isDeletingSchedule,
      handleSaveSchedule,
      handleUpdateSchedule,
      handleRemoveSchedule,
      handleToggleComplete
    },
    coverage: {
      totalCount,
      completedCount,
      overdueCount,
      pendingCount
    },
    generator: {
      showGenerator,
      setShowGenerator
    },
    drawer: {
      slotModalState,
      openSlotModal,
      closeSlotModal,
      setSlotModalField,
      programOptions,
      segmentOptions,
      subjectOptions,
      mediumOptions,
      topicOptions,
      sectionOptions,
      periodSlots,
      isFetchingPeriodTemplate,
      isFetchingProgramSegments,
      isFetchingSubjects,
      isFetchingTopics,
      isFetchingSections
    },
    modal: {
      selectedScheduleForModal,
      setSelectedScheduleForModal,
      closeScheduleModal: () => setSelectedScheduleForModal(null)
    }
  }
}
