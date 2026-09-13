export interface PeriodSlot {
  id: string
  start_time: string
  end_time: string
  duration: number
  isBreak: number
  title: string
}

export const PERIOD_SLOTS: PeriodSlot[] = [
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

export const SECTIONS = [
  { label: 'Section A', value: 'A' },
  { label: 'Section B', value: 'B' },
  { label: 'Section C', value: 'C' }
]

export interface PlannedSchedule {
  id: string
  period_id: string
  period_title?: string
  date: string // YYYY-MM-DD
  program_id?: string
  program_name?: string
  segment_id?: string
  segment_name?: string
  subject_id?: string
  subject_name?: string
  topic_id: string
  topic_name: string
  medium_id?: string
  section_id?: string
  section_name?: string
  completed?: boolean
}

export interface SlotModalState {
  date: string
  period_id: string
  program_id: string
  segment_id: string
  subject_id: string
  topic_id: string
  medium_id: string
  section_id: string
}

export interface SelectedScheduleModalState {
  schedule: PlannedSchedule
}
