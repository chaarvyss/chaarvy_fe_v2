type FormOneDetails = {
  admission_number: string
  student_name: string
  program_id: string
  segment_id: string
  section_id: string
  medium_id: string
  gender_id: string
  dob: string
  contact_no_1: string
  student_email: string
  student_aadhar: string
  pen_number?: string
  apaar_number?: string
  referred_by?: string
}

type CreateUpdateAdmissionFormOneRequest = FormOneDetails & {
  student_id?: string
}

type AdmissionFormOneDetailsResponse = CreateUpdateAdmissionFormOneRequest & {
  student_course_enrollment_id: string
  photo_url?: string
  application_fees_status?: number
}

type StudentDetails = {
  qualified_exam?: string
  qualified_exam_hallticket_no?: string
  qualified_exam_year_of_pass?: string
  father_name?: string
  father_occupation?: string
  mother_name?: string
  mother_occupation?: string
  contact_no_2?: string
  father_aadhar?: string
  mother_aadhar?: string
  religion?: string
  community?: string
  subcaste?: string
}

type StudentDetailsRequest = StudentDetails & {
  student_id?: string
}

type AvailableAddonCourseForStudentResponse = {
  program_addon_course_id: string
  addon_course_id: string
  addon_course_name: string
  addon_course_fees: number
  seating_capacity: number
  enrolled_count: number
  available: number
}

type StudentAddonCourseResponse = {
  student_addon_course_enrollment_id: string
  program_addon_course_id: string
  fees: number
  status: number
}

type EnrollAddonCourseRequest = {
  student_addon_course_enrollment_id?: string
  student_course_enrollment_id: string
  program_addon_course_id: string
  status: number
  fees: number
}

// Raw fees response types

type CourseFee = {
  program_fees_id: string
  fees: string
  fees_type_id: string
  fees_type_name: string
  final_fees?: number
}

type Book = {
  book_id: string
  book_name: string
  price: number
  quantity: number
  is_required: boolean
}

type AddonCourse = {
  addon_course_id: string
  addon_course_name: string
  fees: number
  final_fees?: number
}

type RawFeesDetailsResponse = {
  course_fees: CourseFee[]
  books_fees: Book[]
  addon_course_fees: AddonCourse[]
}

type SavedFeesJson = {
  courseFees?: Record<string, number>
  booksDetails?: Record<string, boolean>
  addonCourseDetails?: Record<string, number>
}

type FeesState = {
  courseFees: CourseFee[]
  booksDetails: Book[]
  addonCourseDetails: AddonCourse[]
}

type SetFeesDetailsRequest = {
  fees_details: SavedFeesJson
  student_course_enrollment_id: string
  payable_fees: number
  payment_aggrement?: number
  no_of_terms?: number
}

type TabStatusResponse = {
  student_base_details: number
  student_details: number
  address: number
  addon_course: number
  fees: number
}
