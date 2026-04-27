import { useEffect, useState } from 'react'

import { Box, IconButton, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { FilterProps } from 'src/lib/interfaces'
import { CascadingSelectorState } from 'src/reusable_components/CascadingSelectors'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'
import { useLazyGetBooksListQuery } from 'src/store/services/listServices'
import GetChaarvyIcons from 'src/utils/icons'

import AddUpdateBooks from './add_books'

const BooksList = () => {
  const { openDrawer } = useSideDrawer()
  const [fetchBooks, { data: booksResponse, isLoading }] = useLazyGetBooksListQuery()
  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })
  const [isAddBooksModalOpen, setIsAddBookModalOpen] = useState<boolean>(false)

  const [selectedDetails, setSelectedDetails] = useState<CascadingSelectorState>()

  const handleAddBook = () => {
    setIsAddBookModalOpen(true)
  }

  const handleAddBooksModalClose = () => {
    setSelectedDetails(undefined)
    setIsAddBookModalOpen(false)
  }

  useEffect(() => {
    fetchBooks(filterProps)
  }, [])

  const handleFiltersChange = (params?: FilterProps) => {
    fetchBooks({ ...filterProps, ...params })
  }

  const onFilterButtonClick = () => {
    openDrawer({
      title: 'Filters',
      content: (
        <RenderFilterOptions onSubmit={handleFiltersChange} fields={['search', 'program', 'segment', 'medium']} />
      )
    })
  }

  const columns: ChaarvyTableColumn[] = [
    {
      id: 's.no',
      label: '#',
      hideable: false,
      render: (row, index) => (
        <Typography variant='body1'>{(filterProps?.limit ?? 0) * (filterProps?.offset ?? 0) + (index + 1)}</Typography>
      )
    },
    {
      id: 'book_name',
      label: 'Book Name',
      render: row => (
        <Box>
          <Typography variant='body1'>{row.book_name}</Typography>
          <Typography variant='caption' color='textSecondary'>
            {row.is_common ? 'Common book' : `${row.program} - ${row.segment} - ${row.medium}`}
          </Typography>
        </Box>
      )
    },
    {
      id: 'available_quantity',
      label: 'Available qty',
      hideable: true
    },
    {
      id: 'price',
      label: 'Price',
      hideable: true
    },
    {
      id: 'actions',
      label: '',
      width: '10px',
      hideable: false,
      render: row => (
        <IconButton
          onClick={() => {
            setSelectedDetails({
              program: row.program,
              segment: row.segment,
              medium: row.medium
            })
            handleAddBook()
          }}
        >
          <GetChaarvyIcons iconName='Pencil' />
        </IconButton>
      )
    }
  ]

  return (
    <>
      <AddUpdateBooks isOpen={isAddBooksModalOpen} onClose={handleAddBooksModalClose} defaultData={selectedDetails} />
      <ChaarvyTable
        tableTitleHeaderProps={{
          title: 'Books',
          buttonTitle: 'Add books',
          onButtonClick: handleAddBook,
          showFilterIcon: true,
          handleFilterButtonClick: onFilterButtonClick,
          icon: <GetChaarvyIcons iconName='FilePlus' />
        }}
        paginationProps={{
          total: booksResponse?.counts?.filtered ?? 0,
          onChange: data => setFilterProps({ ...filterProps, ...data })
        }}
        tableDataProps={{
          columns,
          data: booksResponse?.booksDetails ?? [],
          getRowKey: row => row.book_id,
          emptyMessage: 'No Books available',
          isLoading
        }}
      />
    </>
  )
}

export default BooksList
