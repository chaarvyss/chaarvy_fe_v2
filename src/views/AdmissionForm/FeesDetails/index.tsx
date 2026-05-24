import { Box, Typography } from '@muiElements'
import { useEffect, useMemo, useState, useCallback } from 'react'

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
    if (feesDetails?.course_fees) {
      setCourseFees(feesDetails.course_fees)
    }
  }, [feesDetails])

  const handleCourseFeesChange = useCallback((row: CourseFees, value: number) => {
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
  }, [])

  const stats = useMemo(() => {
    return courseFees.reduce(
      (acc, each) => {
        const actual = Number(each.fees || 0)
        const payable = Number(each.final_fees || 0)

        acc.actual += actual
        acc.payable += payable
        acc.discount += actual - payable

        return acc
      },
      {
        actual: 0,
        payable: 0,
        discount: 0
      }
    )
  }, [courseFees])

  const discountPercent = stats.actual > 0 ? ((stats.discount / stats.actual) * 100).toFixed(2) : '0'

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          justifyContent: 'space-around',
          p: 2
        }}
      >
        <Typography>Actual : {stats.actual}</Typography>

        <Typography>Payable : {stats.payable}</Typography>

        <Typography>Discount : {stats.discount}</Typography>

        <Typography>Discount % : {discountPercent}%</Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
        gap={3}
        height='70vh'
        overflow='auto'
      >
        <CourseFees courseFees={courseFees} handleCourseFeesChange={handleCourseFeesChange} />

        <BooksFees courseFees={courseFees} handleCourseFeesChange={handleCourseFeesChange} />
      </Box>
    </Box>
  )
}

export default FeesDetails
