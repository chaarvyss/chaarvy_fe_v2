import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { DeleteOutline } from 'mdi-material-ui'
import React, { useEffect, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { TableHeaders } from 'src/lib/interfaces'
import { Books, Program } from 'src/lib/types'
import ChaarvyAccordian from 'src/reusable_components/chaarvyAccordian'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useCreateProgramBookMutation, useUpdateProgramBookMutation } from 'src/store/services/adminServices'
import { useGetBooksListQuery, useGetProgramsListQuery, useGetSegmentsListQuery } from 'src/store/services/listServices'
import {
  useLazyGetProgramBooksListQuery,
  useLazyGetProgramMediumsListQuery,
  useLazyGetProgramSecondLanguagesListQuery
} from 'src/store/services/programServices'

interface BooksModalProps {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

type ProgramBook = {
  program_id: string
  book_id: string
  segment_id: string
  second_language: string
  medium: string
}

const ProgramBooksModal = ({ selectedProgram, isOpen, onClose }: BooksModalProps) => {
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false)
  const [selectedBook, setSelectedBook] = useState<Books>()

  const [isRemoveBookModalOpen, setIsRemoveBookModalOpen] = useState<boolean>(false)

  const { data: segmentsList } = useGetSegmentsListQuery()
  const { data: booksList } = useGetBooksListQuery()
  const { data: programsList } = useGetProgramsListQuery(true)
  const [fetchProgramMediums, { data: programMediums }] = useLazyGetProgramMediumsListQuery()
  const [fetchProgramSecondLanguages, { data: programSecondLanguages }] = useLazyGetProgramSecondLanguagesListQuery()
  const [createProgramBook] = useCreateProgramBookMutation()
  const [updateProgramBook] = useUpdateProgramBookMutation()

  const [bookDetail, setBookDetail] = useState<ProgramBook>({
    program_id: '',
    book_id: '',
    segment_id: '',
    second_language: '',
    medium: ''
  })

  const [fetchProgramBooksList, { data: booksDetails }] = useLazyGetProgramBooksListQuery()

  const headers: TableHeaders[] = [{ label: 's#' }, { label: 'Book Name' }, { label: 'Actions', width: '100px' }]
  const { triggerToast } = useToast()

  useEffect(() => {
    setBookDetail({ ...bookDetail, program_id: selectedProgram?.program_id ?? '' })
    fetchProgramSecondLanguages(selectedProgram?.program_id ?? '')
    fetchProgramMediums(selectedProgram?.program_id ?? '')
  }, [selectedProgram])

  useEffect(() => {
    if (bookDetail.medium !== '' && bookDetail.second_language !== '') {
      fetchProgramBooksList(bookDetail)
    }
  }, [bookDetail.second_language, bookDetail.medium])

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

  const handleKebabOptionClick = (book: Books, option: 'Remove') => {
    setSelectedBook(book)
    switch (option) {
      case 'Remove':
        setIsRemoveBookModalOpen(true)
        break
    }
  }

  const resetState = () => {
    setBookDetail({ ...bookDetail, book_id: '', segment_id: '' })
  }

  const handleBookModalClose = () => {
    setSelectedBook(undefined)
    resetState()
    setIsBookModalOpen(false)
  }

  const handleChange =
    (prop: keyof ProgramBook) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
      setBookDetail({ ...bookDetail, [prop]: event.target.value })
    }

  const handleSubmit = () => {
    const action = selectedBook ? updateProgramBook : createProgramBook

    action({
      ...bookDetail,
      program_id: bookDetail?.program_id,
      program_book_id: selectedBook?.program_book_id ?? undefined
    })
      .unwrap()
      .then(response => {
        handleBookModalClose()
        triggerToast(response, { variant: ToastVariants.SUCCESS })
      })
      .catch(e => triggerToast(e.data, { variant: ToastVariants.ERROR }))
  }

  const BookModalFooter = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button onClick={handleSubmit} variant='contained'>{`${selectedBook ? 'Edit' : 'Add'} Book`}</Button>
      </Box>
    )
  }

  const program_medium_id = 'program_medium_id'
  const second_language_id = 'second_language_id'

  const renderCreateOrEditBookModal = () => {
    return (
      <ChaarvyModal
        isOpen={isBookModalOpen}
        footer={BookModalFooter()}
        shouldRestrictCloseOnOuterClick
        shouldWarnOnClose
        onClose={handleBookModalClose}
        title={`${selectedBook ? 'Edit' : 'Add'} Book`}
      >
        <>
          <Box>
            <FormControl sx={{ mb: 4 }} fullWidth>
              <InputLabel id='program'>Program</InputLabel>
              <Select
                labelId='program'
                id='program'
                disabled={!!selectedProgram}
                value={selectedProgram?.program_id}
                label='Program'
                onChange={handleChange('program_id')}
              >
                {programsList?.map(each => <MenuItem value={each.program_id}>{each.program_name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ mb: 4 }} fullWidth>
              <InputLabel id='segment'>Segment</InputLabel>
              <Select
                labelId='segment'
                id='segment'
                disabled={!!selectedBook}
                value={selectedBook?.segment_id}
                label='Segment'
                onChange={handleChange('segment_id')}
              >
                {segmentsList?.map(each => <MenuItem value={each.segment_id}>{each.segment_name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ mb: 4 }} fullWidth>
              <InputLabel id='book'>Book</InputLabel>
              <Select
                labelId='book_id'
                id='book'
                disabled={!!selectedBook}
                value={selectedBook?.book_id}
                label='Segment'
                onChange={handleChange('book_id')}
              >
                {booksList?.map(each => <MenuItem value={each.book_id}>{each.book_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </>
      </ChaarvyModal>
    )
  }

  const handleOnAddBookBtnClick = () => {
    setBookDetail({ ...bookDetail, program_id: selectedProgram?.program_id ?? '' })
    setIsBookModalOpen(true)
  }

  const showAddProgramBookButton = (): boolean => {
    return ((booksDetails?.segments.length ?? 0) == 0 || booksDetails?.segments.length !== segmentsList?.length) ?? 0
  }

  const isNoBooksAvailable =
    bookDetail.medium !== '' && bookDetail.second_language !== '' && booksDetails?.segments.length == 0
  return (
    <>
      <ChaarvyModal
        modalSize='col-12 col-md-6'
        isOpen={isOpen}
        onClose={onClose}
        shouldRestrictCloseOnOuterClick
        title={`${selectedProgram?.program_name} Books`}
      >
        <>
          <Grid container gap={2}>
            <Grid item xs={12} lg={5}>
              <FormControl>
                <FormLabel id={program_medium_id}>Mediums</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby={program_medium_id}
                  name={program_medium_id}
                  id={program_medium_id}
                  value={bookDetail.medium}
                  onChange={handleChange('medium')}
                >
                  {(programMediums ?? []).map(each => (
                    <FormControlLabel value={each.language_id} control={<Radio />} label={each.language_name} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} lg={5}>
              <FormControl>
                <FormLabel id={second_language_id}>Second Language</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby={second_language_id}
                  name={second_language_id}
                  id={second_language_id}
                  value={bookDetail.second_language}
                  onChange={handleChange('second_language')}
                >
                  {(programSecondLanguages ?? []).map(each => (
                    <FormControlLabel value={each.language_id} control={<Radio />} label={each.language_name} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          {booksDetails?.segments?.map(eachSegment => (
            <ChaarvyAccordian title={eachSegment?.segment_name}>
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
                            <TableCell>
                              <IconButton onClick={() => handleKebabOptionClick(eachBook, 'Remove')}>
                                <DeleteOutline color='error' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button onClick={handleOnAddBookBtnClick}>Add Book</Button>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Button onClick={handleOnAddBookBtnClick}>Add Book</Button>
                </Box>
              )}
            </ChaarvyAccordian>
          ))}

          {isNoBooksAvailable && (
            <Typography textAlign='center' padding={3} marginTop={5}>
              No Books Available for the selected Details. Please Add
            </Typography>
          )}

          {showAddProgramBookButton() && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Button onClick={handleOnAddBookBtnClick}>Add Book</Button>
            </Box>
          )}
        </>
      </ChaarvyModal>
      {removeBookConfirmationModal()}
      {renderCreateOrEditBookModal()}
    </>
  )
}

export default ProgramBooksModal
