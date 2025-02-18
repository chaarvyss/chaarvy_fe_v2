export type AddOnCourse = {
  addon_course_id: string
  addon_course_name: string
  status: number
}

export type BooksTypesResponse = {
  book_id: string
  book_name: string
  pages: number
  price: number
}

export type Community = { community_id: string; community_name: string }

export type District = { district_id: string; district_name: string }

export type Fees = {
  program_fees_id: string
  fees_type: string
  fees: number
}

export type FeesTypesResponse = {
  fees_type: string
  fees_type_id: string
}

export type Books = {
  program_book_id: string
  program_id: string
  segment_id: string
  book_id: string
  book_name: string
  quantity: number
}

export type BooksSegment = Segment & {
  books: Books[]
}

export type FeesSegment = Segment & {
  fees: Fees[]
}

export type Gender = { gender_id: string; gender_name: string }

export type Language = { languages_id: string; languages_name: string }
export type Occupation = { occupation_id: string; occupation_name: string }
export type Program = {
  program_id: string
  program_name: string
  status?: number
}

export type ProgramBooksDetails = {
  program_name: string
  segments: BooksSegment[]
}

export type ProgramDetails = {
  program_segment_id: string
  segment_name: string
}

export type ProgramFeesDetailsResponse = {
  program_name: string
  segments: FeesSegment[]
}

export type QualifiedExam = { qualified_exam_id: string; qualified_exam_name: string }
export type Segment = {
  segment_name: string
  segment_id: string
}

export type Religions = { religion_id: string; religion_name: string }
export type State = { state_id: string; state_name: string }
