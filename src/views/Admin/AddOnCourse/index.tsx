import { useState } from 'react'

import { IconButton } from '@muiElements'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'
import GetChaarvyIcons from 'src/utils/icons'

import ProgramAddonCourseModal from '../Programs/Modals/AddonCourses'

const AddOnCourse = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'srno',
      label: '#',
      width: 30,
      render: (_, index) => <span>{index + 1}</span>
    },
    {
      id: 'course_name',
      label: 'Course Name',
      render: rowData => <span>{rowData.course_name}</span>
    },
    {
      id: 'status',
      label: 'Status',
      render: rowData => <span>{rowData.status}</span>
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 50,
      render: rowData => (
        <IconButton onClick={() => setSelectedCourse(rowData.course_id)}>
          <GetChaarvyIcons iconName='Pencil' fontSize='1.25rem' color='orange' />
        </IconButton>
      )
    }
  ]

  const TableData = [
    {
      course_id: 'c1',
      course_name: 'Course 1',
      status: 'Active'
    },
    {
      course_id: 'c2',
      course_name: 'Course 2',
      status: 'Inactive'
    }
  ]

  return (
    <>
      <ChaarvyTable
        tableTitleHeaderProps={{
          title: 'Add-On Courses'
        }}
        tableDataProps={{ data: TableData, columns: columns, getRowKey: row => row.course_id }}
      />

      <ProgramAddonCourseModal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse('')}
        course_id={selectedCourse}
      />
    </>
  )
}

export default AddOnCourse
