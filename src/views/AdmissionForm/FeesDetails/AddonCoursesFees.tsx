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
        getRowKey: row => row.addon_course_id,
        emptyMessage: 'No Addon courses enrolled',
        isLoading: false,
        shouldHideActions: true
      }}
    />
  )
}

export default AddonCoursesFees
