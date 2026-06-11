import { Checkbox, FormControlLabel } from '@mui/material'

import ChaarvyTable from 'src/components/Tables/ChaarvyTable'

interface BooksFeeProps {
  books: Book[]
  handleBooksChange: (row: Book) => void
}

const BooksFees = ({ books, handleBooksChange }: BooksFeeProps) => {
  const columns: ChaarvyTableColumn[] = [
    {
      id: 'index',
      label: 'Selected',
      render: row => (
        <FormControlLabel
          control={<Checkbox checked={row.is_required} onChange={() => handleBooksChange(row)} />}
          label={''}
        />
      )
    },
    {
      id: 'book_name',
      label: 'Books'
    },
    {
      id: 'quantity',
      label: 'Quantity'
    },
    {
      id: 'price',
      label: 'Price'
    }
  ]

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Books Fees',
        iconName: 'Book'
      }}
      tableDataProps={{
        columns,
        data: books,
        getRowKey: row => row.book_id,
        emptyMessage: 'No Books available',
        isLoading: false,
        shouldHideActions: true
      }}
    />
  )
}

export default BooksFees
