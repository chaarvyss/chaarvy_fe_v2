import { Box, Typography } from '@muiElements'
import { useEffect, useMemo, useState, useCallback } from 'react'

import {
  useGetRawFeesDetailsQuery,
  useGetStudentActiveCourseEnrollmentIdQuery
} from 'src/store/services/admisissionsService'

import CourseFees from './CourseFees'
import BooksFees from './BooksFees'
import AddonCoursesFees from './AddonCoursesFees'

interface FeesDetailsProps {
  student_id?: string
}

const FeesDetails = ({ student_id }: FeesDetailsProps) => {
  const { data: student_course_enrollment_id } = useGetStudentActiveCourseEnrollmentIdQuery(student_id ?? '', {
    skip: !student_id
  })

  const [courseFees, setCourseFees] = useState<CourseFee[]>([])
  const [booksDetails, setBooksDetails] = useState<Book[]>([])
  const [addonCourseDetails, setAddonCourseDetails] = useState<AddonCourse[]>([])

  const { data: feesDetails } = useGetRawFeesDetailsQuery(student_course_enrollment_id ?? '', {
    skip: !student_course_enrollment_id
  })

  useEffect(() => {
    if (feesDetails?.course_fees) {
      setCourseFees(feesDetails.course_fees)
      setBooksDetails(feesDetails.books_fees ?? [])
      setAddonCourseDetails(feesDetails.addon_course_fees ?? [])
    }
  }, [feesDetails])

  const handleCourseFeesChange = useCallback((row: CourseFee, value: number) => {
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

  const handleAddonCourseFeesChange = useCallback((row: AddonCourse, value: number) => {
    setAddonCourseDetails(prev =>
      prev.map(item =>
        item.addon_course_id === row.addon_course_id
          ? {
              ...item,
              final_fees: value
            }
          : item
      )
    )
  }, [])

  const handleBooksChange = useCallback((row: Book) => {
    setBooksDetails(prev =>
      prev.map(item => (item.book_id === row.book_id ? { ...item, is_required: !item.is_required } : item))
    )
  }, [])

  const stats = useMemo(() => {
    const courseStats = courseFees.reduce(
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

    booksDetails.forEach(book => {
      if (book.is_required) {
        const price = Number(book.price || 0)

        courseStats.actual += price
        courseStats.payable += price
      }
    })

    return courseStats
  }, [courseFees, booksDetails])

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
        <BooksFees books={booksDetails} handleBooksChange={handleBooksChange} />
        <AddonCoursesFees addonCourses={addonCourseDetails} handleAddonCourseFeesChange={handleAddonCourseFeesChange} />
      </Box>
    </Box>
  )
}

export default FeesDetails
