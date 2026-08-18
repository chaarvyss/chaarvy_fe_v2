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
