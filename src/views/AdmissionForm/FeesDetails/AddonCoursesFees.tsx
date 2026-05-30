import ChaarvyTable from 'src/components/Tables/ChaarvyTable'

import { getColumns } from '.'

interface AddonCoursesProps {
  addonCourses: AddonCourse[]
  handleAddonCourseFeesChange: (row: AddonCourse, value: number) => void
}

const AddonCoursesFees = ({ addonCourses, handleAddonCourseFeesChange }: AddonCoursesProps) => {
  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Addon Courses Fees'
      }}
      tableDataProps={{
        columns: getColumns('addon', handleAddonCourseFeesChange),
        data: addonCourses,
        getRowKey: row => row.book_id,
        emptyMessage: 'No Admissions',
        isLoading: false,
        shouldHideActions: true
      }}
    />
  )
}

export default AddonCoursesFees
