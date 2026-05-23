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
  pen_number: string
  apaar_number: string
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
