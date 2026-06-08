import { useEffect, useMemo, useState } from 'react'

import { Box, Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import CascadingSelectors, { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyDataTable, { EditedDataTableOnSubmitPayload } from 'src/reusable_components/Table/ChaarvyDataTable'
import { useCreateUpdateBookMutation } from 'src/store/services/adminServices'
import { useGetBooksListQuery } from 'src/store/services/listServices'
import ItemTypeForm from 'src/views/Admin/Books/Components/ItemTypeForm'
import BulkProcessStatusModal, {
  getDefaultProcessStats,
  getProcessedStats,
  ProcessStatRow
} from 'src/views/common/BulkProcessStatusModal'

import { generateCommonBooksPayload, generateSpecificBooksPayload, getAggregatedBooks } from './helpers'

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

  const [itemType, setItemType] = useState<ItemType>('specific')

  const normalizedDefaultData = useMemo(() => {
    if (!defaultData) return { program: [], segment: '', medium: '' }

    return {
      ...defaultData,
      program: Array.isArray(defaultData.program)
        ? defaultData.program
        : defaultData.program
          ? [defaultData.program]
          : []
    }
  }, [defaultData])

  const [filterData, setFilterData] = useState<CascadingSelectorState>(normalizedDefaultData)

  const hasPrograms = Array.isArray(filterData.program) ? filterData.program.length > 0 : Boolean(filterData.program)
  const isSpecificFilterReady = Boolean(hasPrograms && filterData.segment && filterData.medium)
  const isFilterReady = itemType === 'specific' ? isSpecificFilterReady : true

  const queryParams = useMemo(() => {
    if (itemType === 'specific') {
      const rawPrograms = Array.isArray(filterData.program)
        ? filterData.program
        : filterData.program
          ? [filterData.program]
          : []

      const validPrograms = rawPrograms.filter((p): p is string => !!p && typeof p === 'string')

      return {
        program_id: validPrograms, // Assumes backend expects program_id parameter
        segment_id: filterData.segment,
        medium_id: filterData.medium,
        isCommon: false
      }
    }

    return { isCommon: true }
  }, [itemType, filterData])

  const { data: booksListResponse, isFetching: isFetchingBooks } = useGetBooksListQuery(
    { ...queryParams, offset: 0, limit: 100 },
    { skip: itemType === 'specific' && !isFilterReady }
  )

  const aggregatedBooks = useMemo(() => {
    if (!booksListResponse?.booksDetails) return []

    return getAggregatedBooks(booksListResponse.booksDetails)
  }, [booksListResponse?.booksDetails])

  const columns: ChaarvyTableColumn[] = useMemo(
    () => [
      { id: 'sno', label: '#', width: 30, render: (_, index) => <Typography variant='body2'>{index + 1}</Typography> },
      {
        id: 'book_name',
        label: 'Book Name',
        editable: true,
        inputType: 'text',
        width: 250,
        render: (row: any) => (
          <Box>
            <Typography variant='body1'>{row.book_name}</Typography>
            {row.book_id && (
              <Typography variant='caption' color='textSecondary'>
                {row.isCommon
                  ? 'Common book'
                  : `(${row.program_names?.join(', ') || ''}) - ${row.segment} - ${row.medium}`}
              </Typography>
            )}
          </Box>
        )
      },
      { id: 'price', label: 'Price', editable: true, inputType: 'number', width: 40 },
      { id: 'available_quantity', label: 'Stock', editable: true, inputType: 'number', width: 40 }
    ],
    []
  )

  useEffect(() => {
    setItemType(selectedItemType)
  }, [selectedItemType])

  const handleEditSubmit = (payload: EditedDataTableOnSubmitPayload) => {
    const formattedPayload =
      itemType === 'specific' ? generateSpecificBooksPayload(payload, filterData) : generateCommonBooksPayload(payload)

    setProcessStats(getDefaultProcessStats(payload))
    setIsBulkProcessStatusModalOpen(true)

    if (!formattedPayload?.length) return

    createUpdateBook(formattedPayload)
      .unwrap()
      .then(res => {
        if (res) {
          triggerToast('Process completed', { variant: ToastVariants.SUCCESS })
          setProcessStats(prev => getProcessedStats(prev, res))
        }
      })
      .catch((err: any) => {
        triggerToast(err?.data || 'Something went wrong', { variant: ToastVariants.ERROR })
      })
  }

  const renderTable = () => {
    if (itemType === 'specific' && !isFilterReady) {
      return (
        <ChaarvyFlex className={{ height: '200px', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant='body2'>Please select Program, Segment and Medium to view the books</Typography>
        </ChaarvyFlex>
      )
    }

    return (
      <ChaarvyDataTable
        showColumnToggle={false}
        editable
        columns={columns}
        data={isFetchingBooks ? [] : aggregatedBooks}
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
            <ItemTypeForm defaultValue={itemType} onValueChange={setItemType} />

            {itemType === 'specific' && (
              <CascadingSelectors
                onChange={setFilterData}
                defaultValues={normalizedDefaultData}
                isMultiProgram={true}
              />
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
