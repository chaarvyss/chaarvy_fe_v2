import { Box } from '@muiElements'
import { useEffect, useState } from 'react'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import {
  useGetRawFeesDetailsQuery,
  useGetStudentActiveCourseEnrollmentIdQuery
} from 'src/store/services/admisissionsService'
import CourseFees from './CourseFees'
import BooksFees from './BooksFees'

interface FeesDetailsProps {
  student_id?: string
}

const FeesDetails = ({ student_id }: FeesDetailsProps) => {
  const { data: student_course_enrollment_id } = useGetStudentActiveCourseEnrollmentIdQuery(student_id ?? '', {
    skip: !student_id
  })

  const [courseFees, setCourseFees] = useState<CourseFees[]>([])

  const { data: feesDetails } = useGetRawFeesDetailsQuery(student_course_enrollment_id ?? '', {
    skip: !student_course_enrollment_id
  })

  useEffect(() => {
    if (feesDetails) {
      const { course_fees } = feesDetails

      setCourseFees(course_fees)
    }
  }, [feesDetails])

  const handleCourseFeesChange = (row: CourseFees, value: number) => {
    setCourseFees(prev =>
      prev.map(item =>
        item.program_fees_id === row.program_fees_id
          ? {
              ...item,
              final_fees: value
            }
          : item
      )
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }} gap={3}>
      <CourseFees courseFees={courseFees} handleCourseFeesChange={handleCourseFeesChange} />
      <BooksFees courseFees={courseFees} handleCourseFeesChange={handleCourseFeesChange} />
    </Box>
  )
}

export default FeesDetails
