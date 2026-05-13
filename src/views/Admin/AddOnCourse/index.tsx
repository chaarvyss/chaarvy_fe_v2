import { useState } from 'react'

import { IconButton } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'
import Tag from 'src/reusable_components/tag'
import { useCreateUpdateProgramAddonCourseMutation } from 'src/store/services/adminServices'
import { useGetAddonCoursesListQuery } from 'src/store/services/listServices'
import GetChaarvyIcons from 'src/utils/icons'

import ProgramAddonCourseModal from '../Programs/Modals/AddonCourses'
import { AddonCourseDetail } from '../Programs/Modals/AddonCourses/types'

const AddOnCourse = () => {
  const [selectedCourse, setSelectedCourse] = useState<AddonCourseDetail>()
  const { data: addonCourses, isFetching: isfetchingAddonCourses } = useGetAddonCoursesListQuery(false)

  const { triggerToast } = useToast()
  const [createUpdateProgramAddonCourse] = useCreateUpdateProgramAddonCourseMutation()

  const handleToggleStatus = async (courseData: AddonCourseDetail) => {
    createUpdateProgramAddonCourse({
      addon_course_id: courseData.addon_course_id,
      addon_course_name: courseData.addon_course_name,
      status: courseData.status === 1 ? 0 : 1
    })
      .unwrap()
      .then(() => {
        triggerToast('Course saved successfully', { variant: ToastVariants.SUCCESS })
        setSelectedCourse(undefined)
      })
      .catch(() => triggerToast('Failed to save course', { variant: ToastVariants.ERROR }))
  }

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'srno',
      label: '#',
      width: 30,
      render: (_, index) => <span>{index + 1}</span>
    },
    {
      id: 'addon_course_name',
      label: 'Course Name',
      render: rowData => <span>{rowData.addon_course_name}</span>
    },
    {
      id: 'status',
      label: 'Status',
      render: rowData => <Tag status={Number.parseInt(rowData.status)} onClick={() => handleToggleStatus(rowData)} />
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 50,
      render: rowData => (
        <IconButton
          onClick={() =>
            setSelectedCourse({
              addon_course_id: rowData.addon_course_id,
              addon_course_name: rowData.addon_course_name,
              status: rowData.status
            })
          }
        >
          <GetChaarvyIcons iconName='Pencil' fontSize='1.25rem' color='orange' />
        </IconButton>
      )
    }
  ]

  return (
    <>
      <ChaarvyTable
        tableTitleHeaderProps={{
          title: 'Add-On Courses',
          buttonTitle: 'Add Add-On Course',
          onButtonClick: () =>
            setSelectedCourse({
              addon_course_id: undefined,
              addon_course_name: '',
              status: 1
            })
        }}
        tableDataProps={{
          isLoading: isfetchingAddonCourses,
          data: addonCourses ?? [],
          columns: columns,
          getRowKey: row => row.addon_course_id,
          emptyMessage: isfetchingAddonCourses ? 'Fetching Addon courses' : 'No Addon courses found'
        }}
      />
      <ProgramAddonCourseModal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(undefined)}
        addon_course={selectedCourse}
      />
    </>
  )
}

export default AddOnCourse
