import { ReactElement } from 'react'
import { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'

import { AdmissionCounts } from 'src/store/services/admisissionsService'

export type ProgramSegmentMedium = {
  segment: string
  program: string
  medium: string
}

export type AddOnCourse = {
  addon_course_id: string
  addon_course_name: string
  status: number
}

export type BooksListData = {
  book_id: string
  book_name: string
  program: string
  medium: string
  segment: string
  program_id: string
  medium_id: string
  segment_id: string
  price: number
  status: number
  available_quantity: number
}

export type BooksListResponse = {
  booksDetails: BooksListData[]
  counts: AdmissionCounts
}

export type BooksListRequest = CascadingSelectorState & {
  isCommon?: boolean
  offset?: number
  limit?: number
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
  status: number
}

export type RolesListResponse = {
  role_id: string
  role_name: string
}

export type ProgramSegmentMediumBook = {
  program_book_id?: string
  book_id: string
  book_name?: string
  quantity: number
  status?: number
}

export type Books = {
  program_book_id: string
  program_id?: string
  segment_id?: string
  medium_id?: string
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

type FormValueTypes = string | number | boolean | Date

export type InputFields = {
  type: 'input' | 'select' | 'radio' | 'date' | 'button' | 'checkbox' | 'date_range'
  variant?: 'number' | 'string' | 'email'
  isDisabled?: boolean
  id: string
  label: string
  key: string
  value?: FormValueTypes
  customInput?: ReactElement
  placeholder?: string
  onChange: (e: any) => void
  caption?: string
  menuOptions?: MenuOptions[]
  showYearDropdown?: boolean
  showMonthDropdown?: boolean
  isLoading?: boolean
  checked?: boolean
  searchable?: boolean
  onSearch?: (searchText: string) => Promise<{ label: string; value: any }[]>
  onAddNew?: (text?: string) => void
  addNewLabel?: string
  onEdit?: (value: string | number, label: string) => void
  onEditSuccess?: () => void
  isOptionsLoading?: boolean
  isUpdating?: boolean
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

export type ProgramDetails = {
  program_segment_id: string
  segment_name: string
}

export type ProgramFeesDataResponse = {
  program_fees_id: string
  program_id: string
  segment_id: string
  medium_id: string
  section_id: string
  fees_type_id: string
  fees: number
}

export type ProgramSecondLanguagesResponse = {
  language_id: string
  language_name: string
}

export type ProgramSegmentMediumsListResponse = {
  program_segment_medium_id: string
  program_id: string
  segment_name: string
  segment_id: string
  medium_id: string
  medium_name: string
  status: number
}

export type ProgramSectionResponse = {
  section_id: string
  section_name: string
  program_section_id?: string
  program_id: string
  segment_id: string
  seating_capacity: number
}

export type QualifiedExam = { qualified_exam_id: string; qualified_exam_name: string }
export type Segment = {
  segment_name: string
  segment_id: string
}

export type Students = {
  student_name: string
  admission_number: string
  application_id: string
  photo_url?: string
}

export type Religions = { religion_id: string; religion_name: string }
export type State = { state_id: string; state_name: string }
