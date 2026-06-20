import { LoadingButton } from '@mui/lab'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, TextField, Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { InputVariants } from 'src/lib/enums'
import LoadingSpinner from 'src/reusable_components/LoadingSpinner'
import { renderStats } from 'src/reusable_components/Table/TableTilteHeader'
import {
  useGetRawFeesDetailsQuery,
  useGetStudentActiveCourseEnrollmentIdQuery,
  useGetStudentPayableFeesDetailsQuery,
  useSetStudentPayableFeesMutation
} from 'src/store/services/admisissionsService'
import GetChaarvyIcons from 'src/utils/icons'

import AddonCoursesFees from './AddonCoursesFees'
import BooksFees from './BooksFees'
import CourseFees from './CourseFees'

interface FeesDetailsProps {
  student_id?: string
}

const initialState: FeesState = {
  courseFees: [],
  booksDetails: [],
  addonCourseDetails: []
}

export const getColumns = (i: 'addon' | 'course', onChange: (row: any, value: number) => void) => {
  const baseColumns: ChaarvyTableColumn[] = [
    {
      id: 'index',
      label: '#',
      render: (row, index) => <Typography>{index + 1}</Typography>
    },
    { id: '', label: '' },
    {
      id: 'fees',
      label: 'Actual fees'
    },

    {
      id: 'final_fees',
      label: 'Final Payable',
      render: row => (
        <TextField
          size='small'
          type={InputVariants.NUMBER}
          value={row.final_fees}
          inputProps={{
            min: 0,
            max: row.fees
          }}
          error={Number(row.final_fees) > Number(row.fees)}
          onChange={e => onChange(row, Number(e.target.value))}
        />
      )
    }
  ]

  if (i === 'course') {
    baseColumns[1] = {
      id: 'fees_type_name',
      label: 'Fees Particular'
    }
  } else {
    baseColumns[1] = {
      id: 'addon_course_name',
      label: 'Addon course'
    }
  }

  return baseColumns
}

const FeesDetails = ({ student_id }: FeesDetailsProps) => {
  const { data: student_course_enrollment_id } = useGetStudentActiveCourseEnrollmentIdQuery(student_id ?? '', {
    skip: !student_id
  })

  const { triggerToast } = useToast()

  const [data, setData] = useState<FeesState>(initialState)

  const [submitPayableFees, { isLoading: isSubmitting }] = useSetStudentPayableFeesMutation()

  const { data: feesDetails, isFetching: isFeesDetailsFetching } = useGetRawFeesDetailsQuery(
    student_course_enrollment_id ?? '',
    {
      skip: !student_course_enrollment_id
    }
  )

  const { data: savedFeesJson } = useGetStudentPayableFeesDetailsQuery(student_course_enrollment_id ?? '', {
    skip: !student_course_enrollment_id
  })

  const hasChanges = useMemo(() => {
    if (!savedFeesJson) return true

    const courseFeesChanged = data.courseFees.some(
      item => Number(item.final_fees) !== savedFeesJson.courseFees?.[item.program_fees_id]
    )
    const booksChanged = data.booksDetails.some(item => item.is_required !== savedFeesJson.booksDetails?.[item.book_id])

    const addonsChanged = data.addonCourseDetails.some(
      item => Number(item.final_fees) !== savedFeesJson.addonCourseDetails?.[item.addon_course_id]
    )

    return courseFeesChanged || booksChanged || addonsChanged
  }, [data, savedFeesJson])

  const mergeData = (initialData: FeesState, savedData?: SavedFeesJson): FeesState => {
    return {
      courseFees: initialData.courseFees.map(item => ({
        ...item,
        final_fees: savedData?.courseFees?.[item.program_fees_id] ?? item.final_fees
      })),

      booksDetails: initialData.booksDetails.map(item => ({
        ...item,
        is_required: savedData?.booksDetails?.[item.book_id] ?? item.is_required
      })),

      addonCourseDetails: initialData.addonCourseDetails.map(item => ({
        ...item,
        final_fees: savedData?.addonCourseDetails?.[item.addon_course_id] ?? item.final_fees
      }))
    }
  }

  const preparePayloadForSave = (data: FeesState): SavedFeesJson => {
    return {
      courseFees: Object.fromEntries(data.courseFees.map(item => [item.program_fees_id, Number(item.final_fees)])),
      booksDetails: Object.fromEntries(data.booksDetails.map(item => [item.book_id, item.is_required])),
      addonCourseDetails: Object.fromEntries(
        data.addonCourseDetails.map(item => [item.addon_course_id, Number(item.final_fees)])
      )
    }
  }

  useEffect(() => {
    if (!feesDetails) return

    const initialData: FeesState = {
      courseFees: feesDetails.course_fees ?? [],
      booksDetails: feesDetails.books_fees ?? [],
      addonCourseDetails: feesDetails.addon_course_fees ?? []
    }

    setData(mergeData(initialData, savedFeesJson))
  }, [feesDetails, savedFeesJson])

  const handleCourseFeesChange = useCallback((row: CourseFee, value: number) => {
    const finalFees = Math.max(0, Number(value) || 0)

    setData(prev => ({
      ...prev,
      courseFees: prev.courseFees.map(item =>
        item.program_fees_id === row.program_fees_id
          ? {
              ...item,
              final_fees: finalFees
            }
          : item
      )
    }))
  }, [])

  const handleAddonCourseFeesChange = useCallback((row: AddonCourse, value: number) => {
    const finalFees = Math.max(0, Number(value) || 0)

    setData(prev => ({
      ...prev,
      addonCourseDetails: prev.addonCourseDetails.map(item =>
        item.addon_course_id === row.addon_course_id
          ? {
              ...item,
              final_fees: finalFees
            }
          : item
      )
    }))
  }, [])

  const handleBooksChange = useCallback((row: Book) => {
    setData(prev => ({
      ...prev,
      booksDetails: prev.booksDetails.map(item =>
        item.book_id === row.book_id
          ? {
              ...item,
              is_required: !item.is_required
            }
          : item
      )
    }))
  }, [])

  const stats = useMemo(() => {
    let actual = 0
    let payable = 0
    let discount = 0

    for (const fee of data.courseFees) {
      const act = Number(fee.fees || 0)
      const pay = Number(fee.final_fees || 0)

      actual += act
      payable += pay
      discount += act - pay
    }

    for (const addon of data.addonCourseDetails) {
      const act = Number(addon.fees || 0)
      const pay = Number(addon.final_fees ?? addon.fees ?? 0)

      actual += act
      payable += pay
      discount += act - pay
    }

    for (const book of data.booksDetails) {
      if (!book.is_required) continue

      const price = Number(book.price || 0)

      actual += price
      payable += price
    }

    const discountPercent = actual > 0 ? ((discount / actual) * 100).toFixed(2) : '0'

    return {
      actual,
      payable,
      discount,
      discountPercent
    }
  }, [data])

  const handleSubmit = () => {
    if (!student_course_enrollment_id) return
    const fees_details = preparePayloadForSave(data)
    submitPayableFees({ fees_details, student_course_enrollment_id, payable_fees: stats.payable })
      .unwrap()
      .then(res => {
        triggerToast(res, { variant: ToastVariants.SUCCESS })
      })
  }

  const showLoader = isFeesDetailsFetching || !student_course_enrollment_id

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          justifyContent: 'space-around',
          alignItems: 'center',
          p: 2
        }}
      >
        {renderStats([
          {
            title: 'Actual fees',
            value: stats.actual,
            color: 'primary',
            icon: <GetChaarvyIcons iconName='CurrencyInr' />
          },
          {
            title: 'Payable fees',
            value: stats.payable,
            color: 'success',
            icon: <GetChaarvyIcons iconName='CurrencyInr' />
          },
          {
            title: 'Discount',
            value: stats.discount,
            color: 'error',
            icon: <GetChaarvyIcons iconName='CurrencyInr' />
          },
          {
            title: 'Discount%',
            value: stats.discountPercent,
            color: 'warning',
            icon: <GetChaarvyIcons iconName='CurrencyInr' />
          }
        ])}

        <LoadingButton
          color='success'
          size='small'
          variant='contained'
          loading={isSubmitting}
          disabled={
            stats.discount < 0 || showLoader || (!!savedFeesJson && !hasChanges) // Disable if updating and no changes made
          }
          onClick={handleSubmit}
        >
          {savedFeesJson ? 'Update Fees details' : 'Finalize'}
        </LoadingButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
        gap={3}
        height='65vh'
        overflow='auto'
      >
        {showLoader ? (
          <LoadingSpinner />
        ) : (
          <>
            <CourseFees courseFees={data.courseFees} handleCourseFeesChange={handleCourseFeesChange} />

            <BooksFees books={data.booksDetails} handleBooksChange={handleBooksChange} />

            <AddonCoursesFees
              addonCourses={data.addonCourseDetails}
              handleAddonCourseFeesChange={handleAddonCourseFeesChange}
            />
          </>
        )}
      </Box>
    </Box>
  )
}

export default FeesDetails
