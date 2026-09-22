export interface BulkValidationSummary {
  total_students: number
  valid_students: number
  error_students: number
  total_course_fees: number
  total_addon_fees: number
  total_books_fees: number
  total_payable_fees: number
  total_addon_enrollments: number
}

export interface ValidRowPreview {
  row_number: number
  admission_number: string
  student_name: string
  total_course_fees: number
  total_addon_fees: number
  total_books_fees: number
  payable_fees: number
  addon_courses: string[]
}

export interface InvalidRowDetail {
  row_number: number
  sheet?: string
  raw_data?: Record<string, any>
  errors: string[]
}

export interface BaseValidationResponse {
  total_rows: number
  valid_count: number
  error_count: number
  invalid_rows: InvalidRowDetail[]
}

export interface StudentValidationResponse extends BaseValidationResponse {
  fee_types_detected?: string[]
  summary?: BulkValidationSummary
  valid_rows_preview?: ValidRowPreview[]
}

export interface StudentUploadResponse {
  message: string
  total_rows: number
  inserted_count: number
  addon_enrollments_count?: number
  payables_count?: number
  books_booked_count?: number
  error_count: number
  has_errors: boolean
  summary?: BulkValidationSummary
  invalid_rows: InvalidRowDetail[]
}

export interface BooksValidationResponse extends BaseValidationResponse {}

export interface BooksUploadResponse {
  message: string
  total_rows: number
  upserted_count: number
  error_count: number
  has_errors: boolean
  invalid_rows: InvalidRowDetail[]
}

export interface BulkTemplateParams {
  include_old?: boolean
  program_id?: string
  segment_id?: string
}

export type UploadMode = 'skip_errors' | 'all_or_nothing'
