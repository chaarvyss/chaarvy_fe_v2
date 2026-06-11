import ChaarvyTable from 'src/components/Tables/ChaarvyTable'

import { getColumns } from '.'

interface CourseFeesProps {
  courseFees: CourseFee[]
  handleCourseFeesChange: (row: CourseFee, value: number) => void
}

const CourseFees = ({ courseFees, handleCourseFeesChange }: CourseFeesProps) => {
  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Course fees',
        iconName: 'AccountCheck'
      }}
      tableDataProps={{
        columns: getColumns('course', handleCourseFeesChange),
        data: courseFees ?? [],
        getRowKey: row => row.application_id,
        emptyMessage: 'No Fees details available',
        isLoading: false,
        shouldHideActions: true
      }}
    />
  )
}

export default CourseFees
