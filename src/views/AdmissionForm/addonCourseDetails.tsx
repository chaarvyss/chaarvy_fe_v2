import { Input, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import {
  useEnrollAddonCourseMutation,
  useGetAddonCoursesAvailableForStudentQuery,
  useGetStudentActiveCourseEnrollmentIdQuery,
  useGetStudentEnrolledAddonCoursesQuery
} from 'src/store/services/admisissionsService'

import { AdmissionFormType } from '.'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'
import { LoadingButton } from '@mui/lab'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import Tag from 'src/reusable_components/tag'

interface AddonCourseDetailsProps {
  student_id?: string
  handleNext: (step: AdmissionFormType) => void
}

const AddonCourseDetails = ({ student_id = '', handleNext }: AddonCourseDetailsProps) => {
  const { data: student_course_enrollment_id } = useGetStudentActiveCourseEnrollmentIdQuery(student_id, {
    skip: !student_id
  })

  const [enrollAddonCourse, { isLoading: isEnrollingCourse }] = useEnrollAddonCourseMutation()
  const { triggerToast } = useToast()

  const { data: studentEnrolledAddonCourses } = useGetStudentEnrolledAddonCoursesQuery(
    student_course_enrollment_id ?? '',
    {
      skip: !student_course_enrollment_id
    }
  )

  const { data: addonCourses, isFetching: isFetchingAddonCourses } = useGetAddonCoursesAvailableForStudentQuery(
    student_id,
    {
      skip: !student_id
    }
  )

  const [selectedCourse, setSelectedCourse] = useState<EnrollAddonCourseRequest>()

  const [showModal, setShowModal] = useState<boolean>(false)

  const handleSubmit = () => {
    if (selectedCourse) {
      enrollAddonCourse(selectedCourse)
        .then(({ data: res }) => {
          if (res) {
            triggerToast(res, { variant: ToastVariants.SUCCESS })
            setSelectedCourse(undefined)
            setShowModal(false)
          }
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  const getOldData = (program_addon_course_id: string) => {
    return (studentEnrolledAddonCourses ?? []).find(each => each.program_addon_course_id == program_addon_course_id)
  }

  const handleEnrollClick = (row: AvailableAddonCourseForStudentResponse) => {
    const old_data = getOldData(row.program_addon_course_id)
    if (student_course_enrollment_id) {
      setSelectedCourse({
        student_course_enrollment_id,
        fees: row.addon_course_fees,
        program_addon_course_id: row.program_addon_course_id,
        status: old_data ? 0 : 1,
        student_addon_course_enrollment_id: old_data?.student_addon_course_enrollment_id
      })
      setShowModal(true)
    }
  }

  const columns: ChaarvyTableColumn[] = [
    {
      id: 's.no',
      label: '#',
      render: (row, index) => <Typography variant='body1'>{index + 1}</Typography>
    },
    {
      id: 'addon_course_name',
      label: 'Addon Course'
    },
    {
      id: 'addon_course_fees',
      label: 'Course fees'
    },

    {
      id: 'available',
      label: 'Seats available'
    },
    {
      id: 'action',
      label: '',
      render: row => {
        const old_data = getOldData(row.program_addon_course_id)
        return old_data ? (
          <Tag status={old_data ? 1 : 0} text={old_data ? 'Enrolled' : 'Enroll'} />
        ) : (
          <LoadingButton
            onClick={() => handleEnrollClick(row)}
            variant={old_data ? 'contained' : 'outlined'}
            color={old_data ? 'warning' : 'success'}
            size='small'
          >
            {old_data ? 'Revoke' : 'Enroll'}
          </LoadingButton>
        )
      }
    }
  ]

  const handleFeesChange = e => {
    setSelectedCourse(prev => {
      if (!prev) return prev

      return {
        ...prev,
        fees: e.target.value
      }
    })
  }

  return (
    <>
      <ChaarvyTable
        tableTitleHeaderProps={{
          title: 'Enroll Addon courses'
        }}
        tableDataProps={{
          columns,
          data: addonCourses ?? [],
          getRowKey: row => row.program_addon_course_id,
          emptyMessage: 'No Addon courses available for this student',
          isLoading: isFetchingAddonCourses
        }}
      />
      <ChaarvyModal title='Course Fees' isOpen={showModal} onClose={() => setShowModal(false)}>
        <>
          <TextField
            onChange={handleFeesChange}
            value={selectedCourse?.fees}
            fullWidth
            id='add_on_course_fess'
            label='Fees'
            sx={{ marginBottom: 4 }}
          />
          <LoadingButton loading={isEnrollingCourse} onClick={handleSubmit}>
            Confirm Enroll
          </LoadingButton>
        </>
      </ChaarvyModal>
    </>
  )
}

export default AddonCourseDetails
