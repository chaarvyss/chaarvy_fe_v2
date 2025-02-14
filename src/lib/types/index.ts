export type AddOnCourse = {
  addon_course_id: string
  addon_course_name: string
  status: number
}

export type Book = {
  segment_id: string
  book_id: string
  book_name: string
  pages: number
}

export type BookDetails = {
  segment: string
  segment_id: string
  books: Book[]
}

export type Community = { community_id: string; community_name: string }

export type Fees = {
  segment_id: string
  fees_type_id: string
  fees_type: string
  fees: number
}

export type FeesDetails = {
  segment: string
  segment_id: string
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

export type QualifiedExam = { qualified_exam_id: string; qualified_exam_name: string }

export type Religions = { religion_id: string; religion_name: string }
