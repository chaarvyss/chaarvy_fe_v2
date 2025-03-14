import { ReactElement } from 'react'

export type AddOnCourse = {
  addon_course_id: string
  addon_course_name: string
  status: number
}

export type BooksTypesResponse = {
  book_id: string
  book_name: string
  price: number
  available_quantity: number
}

export type Community = { community_id: string; community_name: string }

export type DateFormatTypes = 'yyyy-MM-dd'
export type District = { district_id: string; district_name: string }

export type Fees = {
  program_fees_id: string
  segment_id: string
  fees_type: string
  fees: number
}

export type FeesTypesResponse = {
  fees_type: string
  fees_type_id: string
}

export type RolesListResponse = {
  role_id: string
  role_name: string
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

export type MenuOptions = {
  label: string
  value: string | number
}

export type InputFields = {
  type: 'input' | 'select' | 'radio' | 'date'
  variant?: 'number' | 'string' | 'email'
  isDisabled?: boolean
  id: string
  label: string
  key: string
  value?: string | number | boolean | Date
  customInput?: ReactElement
  placeholder?: string
  onChange: (e: any) => void
  caption?: string
  menuOptions?: MenuOptions[]
  showYearDropdown?: boolean
  showMonthDropdown?: boolean
  isLoading?: boolean
}

export type ErrorObject = {
  errorkey: string
  error: string
}

export type Language = { languages_id: string; languages_name: string; status: number }
export type Occupation = { occupation_id: string; occupation_name: string }
export type Program = {
  program_id: string
  program_name: string
  status?: number
}

export type ProgramAddonCourseResponse = {
  program_addon_course_id: string
  program_id: string
  addon_course_id: string
  addon_coures_fees: number
  addon_course_name: string
}

export type ProgramBookRequest = {
  program_id: string
  medium: string
  second_language: string
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

export type ProgramSecondLanguagesResponse = {
  language_id: string
  language_name: string
}

export type QualifiedExam = { qualified_exam_id: string; qualified_exam_name: string }
export type Segment = {
  segment_name: string
  segment_id: string
}

export type Religions = { religion_id: string; religion_name: string }
export type State = { state_id: string; state_name: string }
