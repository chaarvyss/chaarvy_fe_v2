import { useMemo, useState } from 'react'

import { Typography } from '@muiElements'
import CascadingSelectors, { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyDataTable, { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'

interface ProgramBooksModalProps {
  isOpen: boolean
  onClose: () => void
  programId?: string
}

const ProgramBooksModalV2 = ({ isOpen = true, onClose, programId }: ProgramBooksModalProps) => {
  const [filterData, setFilterData] = useState<CascadingSelectorState>({ program: programId, segment: '', medium: '' })

  const handleCascadingChange = (values: any) => {
    setFilterData(values)
    if (Object.values(values).find(value => value === '')) return
    alert('fetch program books with values: ' + JSON.stringify(values))
  }

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
        options: [
          { label: 'Book 1', value: 'book_1' },
          { label: 'Book 2', value: 'book_2' }
        ],
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
    []
  )

  const handleSubmitClick = (data: any) => {
    console.log('Submitted Data:', data)
  }

  return (
    <ChaarvyModal key={programId} isOpen={isOpen} onClose={onClose} title='Program Books' modalSize='col-12 col-md-6'>
      <>
        <ChaarvyFlex className={{ justifyContent: 'end' }}>
          <CascadingSelectors onChange={handleCascadingChange} defaultValues={filterData} />
        </ChaarvyFlex>
        <ChaarvyDataTable
          showColumnToggle={false}
          editable
          columns={columns}
          data={[
            {
              program_book_id: 'prg_book_1',
              book_id: 'book_1',
              quantity: 10,
              status: 0, // for deleted
              restrictEdit: true
            }
          ]}
          getRowKey={(row, index) => row.program_book_id || `temp-${index}`}
          onSubmit={handleSubmitClick}
          isLoading={false}
          loadingText='Fetching books...'
          isSubmitting={false}
        />
      </>
    </ChaarvyModal>
  )
}

export default ProgramBooksModalV2
