import { useEffect, useMemo, useState } from 'react'

import { Box, Typography } from '@muiElements'
import CascadingSelectors, { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'
import { useGetBooksListQuery } from 'src/store/services/listServices'
import ItemTypeForm from 'src/views/Admin/Books/Components/ItemTypeForm'

import { generateCommonBooksPayload, generateSpecificBooksPayload } from './helpers'

export type ItemType = 'common' | 'specific'

interface AddUpdateBooksProps {
  isOpen: boolean
  onClose: () => void
  defaultData?: CascadingSelectorState
  isCommonBook?: boolean
}

const AddUpdateBooks = ({ isOpen, onClose, defaultData, isCommonBook }: AddUpdateBooksProps) => {
  const [itemType, setItemType] = useState<ItemType>('specific')

  const [filterData, setFilterData] = useState<CascadingSelectorState>(
    defaultData || { program: '', segment: '', medium: '' }
  )

  const { program, segment, medium } = filterData
  const isFilterReady = Boolean(program && segment && medium)

  const queryParams = useMemo(() => {
    return itemType === 'specific'
      ? { program_id: program, segment_id: segment, medium_id: medium }
      : { isCommon: true }
  }, [itemType, program, segment, medium])

  const { data: booksListResponse, isFetching: isFetchingBooks } = useGetBooksListQuery(
    { ...queryParams, offset: 0, limit: 100 },
    { skip: itemType === 'specific' && !isFilterReady }
  )

  const tableData = booksListResponse?.booksDetails || []

  const columns: ChaarvyTableColumn[] = useMemo(
    () => [
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
    ],
    []
  )

  useEffect(() => {
    if (isCommonBook) {
      setItemType('common')
    }
  }, [isCommonBook])

  const handleEditSubmit = (payload: EditedDataTableOnSubmitPayload) => {
    const formattedPayload =
      itemType === 'specific' ? generateSpecificBooksPayload(payload, filterData) : generateCommonBooksPayload(payload)
    if (!formattedPayload?.length) return
    console.log(formattedPayload)

    // TODO: call mutation here
  }

  const handleItemTypeChange = (type: ItemType) => {
    setItemType(type)
  }

  const handleCascadingChange = (values: CascadingSelectorState) => {
    setFilterData(values)
  }

  const renderTable = () => {
    if (itemType === 'specific' && !isFilterReady) {
      return (
        <ChaarvyFlex className={{ height: '200px' }}>
          <Typography variant='body2'>Please select Program, Segment and Medium to view the books</Typography>
        </ChaarvyFlex>
      )
    }

    return (
      <ChaarvyDataTable
        showColumnToggle={false}
        editable
        columns={columns}
        data={tableData}
        getRowKey={(row, index) => row.book_id || `temp-${index}`}
        onSubmit={handleEditSubmit}
        isLoading={isFetchingBooks}
        loadingText='Fetching books...'
      />
    )
  }

  return (
    <ChaarvyModal isOpen={isOpen} modalSize='col-12 col-md-8' onClose={onClose}>
      <Box sx={{ gap: 3 }}>
        <Typography variant='h6'>Update Books and Stationary Details</Typography>

        <ChaarvyFlex className={{ justifyContent: 'space-between' }}>
          <ItemTypeForm defaultValue={itemType} onValueChange={handleItemTypeChange} />

          {itemType === 'specific' && (
            <CascadingSelectors onChange={handleCascadingChange} defaultValues={defaultData} />
          )}
        </ChaarvyFlex>

        {renderTable()}
      </Box>
    </ChaarvyModal>
  )
}

export default AddUpdateBooks
