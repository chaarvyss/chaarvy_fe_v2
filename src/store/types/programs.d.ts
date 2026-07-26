type ProgramSegmentSubjectsListRequest = {
  program_id?: string
  segment_id?: string
}

type ProgramSegmentSubject = {
  program_segment_subject_id: string // Updated to match your backend ID naming
  subject_id: string
  program_id: string
  segment_id: string
  status: number
}

type ProgramSegment = {
  program_id: string
  program_name: string
  segment_id: string
  segment_name: string
}

type UserSubject = {
  user_subject_id?: string
  user_id: string
  subject_id: string
  program_id: string
  segment_id: string
  medium_id: string
  status: number
}

type UserSubjectItem = {
  mapping_id?: string
  subject_id: string
  program_id: string
  segment_id: string
  status: number
}

type UserSubjectSyncRequest = {
  data: UserSubjectItem[]
  user_id: string
  medium_ids: string[]
}
