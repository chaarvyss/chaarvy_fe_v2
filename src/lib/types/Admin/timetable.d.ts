type TimeSlot = {
  id: string
  title: string
  start_time: Dayjs
  end_time: Dayjs
  duration: number
  isBreak: number
  sequence?: number
}

type PeriodTemplateRequest = {
  details: TimeSlot[]
  deleted_ids?: string[]
}

type IncomingTemplateData = {
  dayStartTime?: string // e.g., '09:00'
  dayEndTime?: string // e.g., '16:00'
  defaultDuration?: number
  slots?: {
    id: string
    title: string
    start_time: string // e.g., '09:00'
    end_time: string // e.g., '09:45'
    duration: number
    isBreak: number
  }[]
}

type DayOfWeek = {
  id: string
  day_name: string
}

type FacultyAvailabilityResponse = {
  subject: string
  subject_id: string
  available_faculty: {
    user_id: string
    user_name: string
    availability: {
      day_of_week: number
      slots: string[]
    }[]
  }[]
}[]

type TimetableEntry = {
  day_of_week: string
  period_slot_id: string
  faculty_id: string
  subject_id: string
}

type ExistingTimetableData = TimetableEntry & {
  id: string
  faculty_name: string
}

type FacultyTimetableData = {
  id?: string
  day_of_week: string | number
  period_slot_id: string
  program_id?: string
  program_name?: string
  segment_id?: string
  segment_name?: string
  medium_id?: string
  medium_name?: string
  section_id?: string
  section_name?: string
  subject_id?: string
  subject_name?: string
}

type TimetableRequest = {
  params: {
    program_id: string
    segment_id: string
    section_id: string
    medium_id: string
  }
  body: { details: TimetableEntry[]; deleted_ids?: string[] }
}
