import { TextField, Typography } from '@muiElements'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { InputVariants } from 'src/lib/enums'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'

interface CourseFeesProps {
  courseFees: CourseFees[]
  handleCourseFeesChange: (row: CourseFees, value: number) => void
}

const BooksFees = ({ courseFees, handleCourseFeesChange }: CourseFeesProps) => {
  const columns: ChaarvyTableColumn[] = [
    {
      id: 'index',
      label: '#',
      render: (row, index) => <Typography>{index + 1}</Typography>
    },
    {
      id: 'fees_type_name',
      label: 'Fees Type'
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
          onChange={e => handleCourseFeesChange(row, Number(e.target.value))}
        />
      )
    }
  ]

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Course fees',
        iconName: 'AccountCheck'
      }}
      tableDataProps={{
        columns,
        data: courseFees ?? [],
        getRowKey: row => row.application_id,
        emptyMessage: 'No Admissions',
        isLoading: false,
        shouldHideActions: true
      }}
    />
  )
}

export default BooksFees
