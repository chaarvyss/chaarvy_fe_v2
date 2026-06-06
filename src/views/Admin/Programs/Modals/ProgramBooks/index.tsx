import { useEffect, useMemo, useState } from 'react'

import { Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import CascadingSelectors, { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyDataTable, { EditedDataTableOnSubmitPayload } from 'src/reusable_components/Table/ChaarvyDataTable'
import { useLazyGetProgramRelatedBooksOptionsQuery } from 'src/store/services/listServices'
import {
  CreateProgramBookRequest,
  useCreateUpdateProgramBookMutation,
  useLazyGetPrgMedSegBooksListQuery
} from 'src/store/services/programServices'
import BulkProcessStatusModal, {
  getDefaultProcessStats,
  getProcessedStats,
  ProcessStatRow
} from 'src/views/common/BulkProcessStatusModal'

interface ProgramBooksModalProps {
  isOpen: boolean
  onClose: () => void
  programId?: string
}

const ProgramBooksModal = ({ isOpen = true, onClose, programId }: ProgramBooksModalProps) => {
  const { triggerToast } = useToast()
  const [isBulkProcessStatusModalOpen, setIsBulkProcessStatusModalOpen] = useState(false)
  const [filterData, setFilterData] = useState<CascadingSelectorState>({ program: programId, segment: '', medium: '' })
  const [processStats, setProcessStats] = useState<ProcessStatRow[]>([])

  const isFiltersSet = useMemo(() => {
    return Object.values(filterData).every(value => value !== '' && value !== null && value !== undefined)
  }, [filterData])

  const [fetchProgramSuitedBooks, { data: programSuitedBooks }] = useLazyGetProgramRelatedBooksOptionsQuery()
  const [fetchProgramBooks, { data: programBooksData, isFetching: isProgramBooksLoading }] =
    useLazyGetPrgMedSegBooksListQuery()

  const [createUpdateProgramBook, { isLoading: isUpdatingProgramBooksData }] = useCreateUpdateProgramBookMutation()

  const handleCascadingChange = (values: any) => {
    setFilterData(values)

    const hasEmpty = Object.values(values).some(value => value === '' || value === null || value === undefined)

    if (hasEmpty) {
      return
    }
    fetchProgramBooks(values)
    fetchProgramSuitedBooks(values)
  }

  useEffect(() => {
    if (isFiltersSet) {
      fetchProgramBooks(filterData)
      fetchProgramSuitedBooks(filterData)
    }
  }, [filterData])

  const booksList = useMemo(
    () => (programBooksData ?? []).map(each => ({ ...each, status: each.status })),
    [programBooksData]
  )

  const columns: ChaarvyTableColumn[] = useMemo(
    () => [
      {
        id: 'sno',
        label: '#',
        width: 30,
        render: (_, index) => <Typography variant='body2'>{index + 1}</Typography>
      },
      {
        id: 'book_id',
        label: 'Book',
        editable: true,
        inputType: 'select',
        uniqueOptionsOnly: true,
        options: (programSuitedBooks ?? []).map(book => ({ value: book.book_id, label: book.book_name })),
        width: 250
      },
      {
        id: 'quantity',
        label: 'Quantity',
        editable: true,
        inputType: 'number',
        width: 40
      }
    ],
    [programSuitedBooks]
  )

  const handleSubmitClick = (data: EditedDataTableOnSubmitPayload) => {
    const { created, updated, deleted } = data

    const payload: CreateProgramBookRequest[] = [
      ...created
        .filter(c => c && !Object.values(c).some(v => v === undefined))
        .map(item => ({
          ...filterData,
          ...item,
          status: 1
        })),

      ...updated
        .filter(u => u?.program_book_id)
        .map(item => ({
          ...filterData,
          ...item,
          status: 1
        })),

      ...deleted
        .filter(d => d?.program_book_id)
        .map(item => ({
          ...filterData,
          ...item,
          quantity: 0,
          status: 0
        }))
    ]

    setProcessStats(getDefaultProcessStats(data))

    setIsBulkProcessStatusModalOpen(true)
    createUpdateProgramBook(payload)
      .unwrap()
      .then(res => {
        triggerToast('Process completed', { variant: ToastVariants.SUCCESS })

        setProcessStats(prevStats => getProcessedStats(prevStats, res))
      })
  }

  const defaultEntryData = useMemo(
    () =>
      programSuitedBooks?.map(book => ({
        book_id: book.book_id,
        quantity: '1',
        status: '1'
      })),
    [programSuitedBooks]
  )

  return (
    <ChaarvyModal
      key={`${programId}__programs-list`}
      isOpen={isOpen}
      onClose={onClose}
      title='Program Books'
      modalSize='col-12 col-md-8 col-xl-6'
    >
      <>
        <ChaarvyFlex className={{ justifyContent: 'end' }}>
          <CascadingSelectors onChange={handleCascadingChange} defaultValues={filterData} />
        </ChaarvyFlex>
        <ChaarvyDataTable
          showColumnToggle={false}
          editable
          columns={columns}
          data={isProgramBooksLoading ? [] : booksList}
          defaultEntryData={defaultEntryData}
          getRowKey={(row, index) => row.program_book_id || `temp-${index}`}
          onSubmit={handleSubmitClick}
          isLoading={isProgramBooksLoading}
          loadingText='Fetching books...'
          isSubmitting={isUpdatingProgramBooksData}
          emptyMessage={
            isFiltersSet
              ? 'No books found for the selected Program, Segment and Medium.'
              : 'Please select Program, Segment and Medium to view the books.'
          }
          showDefaultEntryButton={Boolean(programBooksData && !isProgramBooksLoading && programBooksData?.length === 0)}
        />
        <BulkProcessStatusModal
          isOpen={isBulkProcessStatusModalOpen}
          onClose={() => {
            setIsBulkProcessStatusModalOpen(false)
            setProcessStats([])
          }}
          isProcessing={isUpdatingProgramBooksData}
          stats={processStats}
        />
      </>
    </ChaarvyModal>
  )
}

export default ProgramBooksModal
