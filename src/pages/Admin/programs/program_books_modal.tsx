import {
  Box,
  Button,
  Card,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import React, { ChangeEvent, useState } from 'react'
import { TableHeaders } from 'src/lib/interfaces'
import { Book, BookDetails, Program } from 'src/lib/types'
import ChaarvyAccordian from 'src/reusable_components/chaarvyAccordian'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import DropDownMenu from 'src/reusable_components/dropDownMenu'

interface BooksModalProps {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

interface CreateBook {
  segment_id: string
  book_name: string
  pages?: number
}

const booksDetails: BookDetails[] = [
  {
    segment: 'Year-1',
    segment_id: 'seg_id',
    books: [
      {
        segment_id: 'seg_id',
        book_name: 'maths 1',
        book_id: 'id of book',
        pages: 99
      }
    ]
  }
]

const ProgramBooksModal = ({ selectedProgram, isOpen, onClose }: BooksModalProps) => {
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false)
  const [selectedBook, setSelectedBook] = useState<Book>()

  const [isRemoveBookModalOpen, setIsRemoveBookModalOpen] = useState<boolean>(false)

  const [bookDetail, setBookDetail] = useState<CreateBook>({
    segment_id: '',
    book_name: '',
    pages: undefined
  })

  const headers: TableHeaders[] = [
    { label: 's#' },
    { label: 'Book Name' },
    { label: 'Pages' },
    { label: 'Actions', width: '100px' }
  ]

  const handleRemoveBookConfirmationModalClose = () => {
    setSelectedBook(undefined)
    setIsRemoveBookModalOpen(false)
  }

  const handleRemoveBook = () => {
    alert(selectedBook?.book_id) // TODO: Need to add API Call and test functionality
    handleRemoveBookConfirmationModalClose()
  }

  const removeBookConfirmationModal = () => {
    return (
      <ChaarvyModal
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Button color='error' variant='outlined' onClick={handleRemoveBookConfirmationModalClose}>
              Decline
            </Button>
            <Button variant='contained' onClick={handleRemoveBook}>
              Confirm
            </Button>
          </Box>
        }
        shouldRestrictCloseOnOuterClick
        isOpen={isRemoveBookModalOpen}
        onClose={handleRemoveBookConfirmationModalClose}
        title='Warning'
      >
        <Typography padding={2}>Are you sure want to remove this book</Typography>
      </ChaarvyModal>
    )
  }

  const handleKebabOptionClick = (book: Book, option: 'Edit' | 'Remove') => {
    setSelectedBook(book)
    switch (option) {
      case 'Edit':
        setBookDetail(({ segment_id, book_name, pages }) => ({ segment_id, book_name, pages }))
        setIsBookModalOpen(true)
        break
      case 'Remove':
        setIsRemoveBookModalOpen(true)
        break
    }
  }

  const getKebabOptions = (eachBook: Book) => {
    // remove book, edit book name
    return [
      {
        id: eachBook.book_id,
        label: 'Edit',
        onOptionClick: () => handleKebabOptionClick(eachBook, 'Edit')
      },
      {
        id: eachBook.book_id,
        label: 'Remove Book',
        onOptionClick: () => handleKebabOptionClick(eachBook, 'Remove')
      }
    ]
  }

  const handleBookModalClose = () => {
    setSelectedBook(undefined)
    setBookDetail({ segment_id: '', book_name: '', pages: undefined })
    setIsBookModalOpen(false)
  }

  const handleChange = (prop: keyof CreateBook) => (event: ChangeEvent<HTMLInputElement>) => {
    setBookDetail({ ...bookDetail, [prop]: event.target.value })
  }

  const BookModalFooter = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button onClick={() => console.log(bookDetail, selectedBook?.book_id, 'book created')} variant='contained'>{`${
          selectedBook ? 'Edit' : 'Add'
        } Book`}</Button>
      </Box>
    )
  }

  const segments = booksDetails.map(eachBook => {
    return { segment: eachBook.segment, segment_id: eachBook.segment_id }
  })

  const renderCreateOrEditBookModal = () => {
    return (
      <ChaarvyModal
        size='30%'
        isOpen={isBookModalOpen}
        footer={BookModalFooter()}
        shouldRestrictCloseOnOuterClick
        shouldWarnOnClose
        onClose={handleBookModalClose}
        title={`${selectedBook ? 'Edit' : 'Add'} Book`}
      >
        <Box>
          <FormControl sx={{ mb: 4 }} fullWidth>
            <InputLabel id='segment'>Segment</InputLabel>
            <Select
              labelId='segment'
              id='segment'
              disabled={!!selectedBook}
              value={bookDetail.segment_id}
              label='Segment'
              onChange={e => setBookDetail({ ...bookDetail, segment_id: e.target.value })}
            >
              {segments?.map(each => (
                <MenuItem value={each.segment_id}>{each.segment}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            onChange={handleChange('book_name')}
            value={bookDetail.book_name}
            fullWidth
            id='book_name'
            label='Book name'
            sx={{ marginBottom: 4 }}
          />
          <TextField
            onChange={handleChange('pages')}
            value={bookDetail.pages}
            fullWidth
            type='number'
            id='book_pages'
            label='Book Pages'
            sx={{ marginBottom: 4 }}
          />
        </Box>
      </ChaarvyModal>
    )
  }

  return (
    <>
      <ChaarvyModal size='80%' isOpen={isOpen} onClose={onClose} title={`${selectedProgram?.program_name} Books`}>
        <>
          {booksDetails.map(eachSegment => (
            <ChaarvyAccordian title={eachSegment.segment}>
              {eachSegment?.books.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {headers.map(each => (
                            <TableCell style={each.width ? { width: each.width } : {}}>{each.label}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eachSegment.books.map((eachBook, index) => (
                          <TableRow>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{eachBook.book_name}</TableCell>
                            <TableCell>{eachBook.pages}</TableCell>
                            <TableCell>
                              <DropDownMenu dropDownMenuOptions={getKebabOptions(eachBook)} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button onClick={() => setIsBookModalOpen(true)}>Add Book</Button>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button onClick={() => setIsBookModalOpen(true)}>Add Book</Button>
                </Box>
              )}
            </ChaarvyAccordian>
          ))}
        </>
      </ChaarvyModal>
      {removeBookConfirmationModal()}
      {renderCreateOrEditBookModal()}
    </>
  )
}

export default ProgramBooksModal
