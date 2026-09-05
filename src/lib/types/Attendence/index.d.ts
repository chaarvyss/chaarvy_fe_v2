type GetActiveStudentsListRequest = {
  program_id: string
  segment_id: string
  medium_id: string
  section_id: string
  need_photo?: boolean
}

type GetActiveStudentsListResponse = {
  student_course_enrollment_id: string
  student_name: string
  image_url: string | null
}

type StudentAttendenceState = {
  student_attendance_id?: string
  student_course_enrollment_id: string
  status: number
}

type GetAttendenceByLogIdRequest = {
  attendance_log_id: string
}

type ClassDetails = {
  program_id: string
  segment_id: string
  medium_id: string
  section_id: string
  subject_id: string
}

type GetAttendenceByLogIdResponse = {
  attendance: StudentAttendenceState[]
  class_details: ClassDetails
  period_slot_id: string
  period_name: string
  date: string
  is_final: number
  created_by: string
}

type RecordStudentAttendenceRequest = {
  attendance_log_id?: string
  program_id: string
  segment_id: string
  medium_id: string
  section_id: string
  period_slot_id: string
  date: string
  attendance_records: StudentAttendenceState[]
}

type CurrentClassDetailsResponse = {
  current_period_id: string
  class_details: ClassDetails
  log_id?: string
}

type GetStudentAttendenceLogsRequest = {
  limit?: number
  offset?: number
  program_id?: string
  segment_id?: string
  medium_id?: string
  section_id?: string
  period_slot_id?: string
  start_date?: string
  end_date?: string
}

type GetStudentAttendenceLog = {
  id: string
  program: string
  segment: string
  medium: string
  section: string
  period: string
  date: string
  status: boolean
}

type GetStudentAttendenceLogsResponse = {
  logs: GetStudentAttendenceLog[]
  total_count: number
  filtered: number
}
