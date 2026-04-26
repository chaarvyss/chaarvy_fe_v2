import { useEffect, useState } from 'react'

import { Box, Typography } from '@muiElements'
import CascadingSelectors, { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyDataTable, { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'
import ItemTypeForm from 'src/views/Admin/Books/Components/ItemTypeForm'

export type ItemType = 'common' | 'specific'

interface AddUpdateBooksProps {
  isOpen: boolean
  onClose: () => void
  defaultData?: CascadingSelectorState
}

const AddUpdateBooks = ({ isOpen, onClose, defaultData }: AddUpdateBooksProps) => {
  const [itemType, setItemType] = useState<ItemType>('specific')

  const booksData = []

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'sno',
      label: '#',
      width: 30,
      render: (_, index) => <Typography variant='body2'>{index + 1}</Typography>
    },
    {
      id: 'book_name',
      label: 'Book Name',
      editable: true,
      inputType: 'text',
      width: 250
    },
    {
      id: 'price',
      label: 'Price',
      editable: true,
      inputType: 'number',
      width: 40
    },
    {
      id: 'stock',
      label: 'Stock',
      editable: true,
      inputType: 'number',
      width: 40
    }
  ]

  useEffect(() => {
    if (defaultData) alert('fetchBooks')
    console.log(defaultData, 'defaultData')
  }, [defaultData])

  const handleEditSubmit = a => {
    console.log(a)
  }

  const onValueChange = (a: ItemType) => {
    setItemType(a)
  }

  const handleProgSegMediumChange = ({ program, segment, medium }: CascadingSelectorState) => {
    console.log(program, segment, medium)
  }

  const handleOnclose = () => {
    onClose()
  }

  const renderAddBooksTable = () => {
    return (
      <ChaarvyDataTable
        showColumnToggle={false}
        editable={true}
        columns={columns}
        data={booksData}
        getRowKey={row => row.book_id}
        onSubmit={handleEditSubmit}
      />
    )
  }

  return (
    <ChaarvyModal isOpen={isOpen} modalSize='col-12 col-md-8' onClose={handleOnclose}>
      <Box sx={{ gap: 3 }}>
        <Typography variant='h6'>Update Books and Stationary Details</Typography>
        <ChaarvyFlex className={{ justifyContent: 'space-between' }}>
          <ItemTypeForm defaultValue={itemType} onValueChange={onValueChange} />
          {itemType === 'specific' && (
            <CascadingSelectors onChange={handleProgSegMediumChange} defaultValues={defaultData} />
          )}
        </ChaarvyFlex>
        {itemType == 'specific' ? renderAddBooksTable() : <Typography>Under progress</Typography>}
      </Box>
    </ChaarvyModal>
  )
}

export default AddUpdateBooks
