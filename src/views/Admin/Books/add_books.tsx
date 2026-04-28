import { useEffect, useMemo, useState } from 'react'

import { Box, Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import CascadingSelectors, { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'
import { useCreateUpdateBookMutation } from 'src/store/services/adminServices'
import { useGetBooksListQuery } from 'src/store/services/listServices'
import ItemTypeForm from 'src/views/Admin/Books/Components/ItemTypeForm'
import BulkProcessStatusModal, { ProcessStatRow } from 'src/views/common/BulkProcessStatusModal'

import { generateCommonBooksPayload, generateSpecificBooksPayload } from './helpers'

export type ItemType = 'common' | 'specific'

interface AddUpdateBooksProps {
  isOpen: boolean
  onClose: () => void
  defaultData?: CascadingSelectorState
  selectedItemType: ItemType
}

const AddUpdateBooks = ({ isOpen, onClose, defaultData, selectedItemType }: AddUpdateBooksProps) => {
  const [createUpdateBook, { isLoading: isLoadingSaveButton }] = useCreateUpdateBookMutation()
  const { triggerToast } = useToast()

  const [isBulkProcessStatusModalOpen, setIsBulkProcessStatusModalOpen] = useState(false)

  const [processStats, setProcessStats] = useState<ProcessStatRow[]>([])

  const [itemType, setItemType] = useState<ItemType>()

  const [filterData, setFilterData] = useState<CascadingSelectorState>(
    defaultData || { program: '', segment: '', medium: '' }
  )

  const { program, segment, medium } = filterData
  const isFilterReady = Boolean(program && segment && medium)

  const queryParams = useMemo(() => {
    return itemType === 'specific' ? { program, segment, medium, isCommon: false } : { isCommon: true }
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
        id: 'available_quantity',
        label: 'Stock',
        editable: true,
        inputType: 'number',
        width: 40
      }
    ],
    []
  )

  useEffect(() => {
    setItemType(selectedItemType)
  }, [selectedItemType])

  const handleEditSubmit = (payload: EditedDataTableOnSubmitPayload) => {
    const formattedPayload =
      itemType === 'specific' ? generateSpecificBooksPayload(payload, filterData) : generateCommonBooksPayload(payload)

    const { created, updated, deleted } = payload

    setProcessStats([
      { id: 'success_created', label: 'Creating', target: created.length, processed: 0 },
      { id: 'success_updated', label: 'Updating', target: [...updated, ...deleted].length, processed: 0 },
      { id: 'skipped', label: 'Skipped', target: 0, processed: 0 },
      { id: 'failed', label: 'Failed', target: 0, processed: 0 }
    ])

    setIsBulkProcessStatusModalOpen(true)

    if (!formattedPayload?.length) return
    createUpdateBook(formattedPayload)
      .unwrap()
      .then(res => {
        if (res) {
          triggerToast('Process completed', { variant: ToastVariants.SUCCESS })

          setProcessStats(prevStats =>
            prevStats.map(stat => {
              const responseData = res[stat.id]

              const processedCount = Array.isArray(responseData)
                ? responseData.length
                : typeof responseData === 'number'
                  ? responseData
                  : 0

              return {
                ...stat,
                processed: processedCount
              }
            })
          )
        }
      })
      .catch((err: any) => {
        triggerToast(err?.data || 'Something went wrong', {
          variant: ToastVariants.ERROR
        })
      })
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
        data={isFetchingBooks ? [] : tableData}
        getRowKey={(row, index) => row.book_id || `temp-${index}`}
        onSubmit={handleEditSubmit}
        isLoading={isFetchingBooks}
        loadingText='Fetching books...'
        isSubmitting={isLoadingSaveButton}
      />
    )
  }

  return (
    <ChaarvyModal
      isOpen={isOpen}
      modalSize='col-12 col-md-8'
      onClose={onClose}
      title='Update Books and Stationary Details'
    >
      <Box sx={{ gap: 3 }}>
        {itemType && (
          <ChaarvyFlex className={{ justifyContent: 'space-between' }}>
            <ItemTypeForm defaultValue={itemType} onValueChange={handleItemTypeChange} />

            {itemType === 'specific' && (
              <CascadingSelectors onChange={handleCascadingChange} defaultValues={defaultData} />
            )}
          </ChaarvyFlex>
        )}
        <BulkProcessStatusModal
          isOpen={isBulkProcessStatusModalOpen}
          onClose={() => {
            setIsBulkProcessStatusModalOpen(false)
            setProcessStats([])
          }}
          isProcessing={isLoadingSaveButton}
          stats={processStats}
        />
        {renderTable()}
      </Box>
    </ChaarvyModal>
  )
}

export default AddUpdateBooks
