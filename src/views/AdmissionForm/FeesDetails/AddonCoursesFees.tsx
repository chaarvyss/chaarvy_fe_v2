import { Checkbox, FormControlLabel, TextField, Typography } from '@mui/material'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { InputVariants } from 'src/lib/enums'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'

interface AddonCoursesProps {
  addonCourses: AddonCourse[]
  handleAddonCourseFeesChange: (row: AddonCourse, value: number) => void
}

const AddonCoursesFees = ({ addonCourses, handleAddonCourseFeesChange }: AddonCoursesProps) => {
  const columns: ChaarvyTableColumn[] = [
    {
      id: 'index',
      label: '#',
      render: (row, index) => <Typography>{index + 1}</Typography>
    },
    {
      id: 'addon_course_name',
      label: 'Addon course'
    },
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
          onChange={e => handleAddonCourseFeesChange(row, Number(e.target.value))}
        />
      )
    }
  ]

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Addon Courses Fees'
      }}
      tableDataProps={{
        columns,
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
