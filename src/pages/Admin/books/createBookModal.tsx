import { TextField } from '@mui/material'
import { Box, Button, Grid, InputLabel } from '@muiElements'
import { ChangeEvent, useEffect, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { BooksTypesResponse } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useCreateBookMutation, useUpdateBookMutation } from 'src/store/services/adminServices'

export interface BookTypeRequest {
  book_name: string
  pages: number
  price: number
}

interface CreateUpdateBookProps {
  selectedBook?: BooksTypesResponse
  isOpen: boolean
  onClose: () => void
}

const CreateOrUpdateBookModal = ({ selectedBook, isOpen, onClose }: CreateUpdateBookProps) => {
  const [bookType, setBookType] = useState<BookTypeRequest>({
    book_name: '',
    pages: 0,
    price: 0
  })
  const { triggerToast } = useToast()
  const [createBook] = useCreateBookMutation()
  const [updateBook] = useUpdateBookMutation()

  const resetState = () => {
    setBookType({ book_name: '', pages: 0, price: 0 })
  }

  const handleSubmit = () => {
    if (selectedBook) {
      updateBook({ book_id: selectedBook.book_id, ...bookType })
        .unwrap()
        .then(response => {
          resetState()
          triggerToast(response, { variant: ToastVariants.SUCCESS })
          onClose()
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    } else {
      createBook(bookType)
        .unwrap()
        .then(response => {
          resetState()
          triggerToast(response, { variant: ToastVariants.SUCCESS })
          onClose()
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }
  const shouldDisableSubmitButton = Object.values(bookType).some(value => value === '' || value === 0)

  const createBookFooter = () => {
    return (
      <Box display='flex' justifyContent='center'>
        <Button disabled={shouldDisableSubmitButton} onClick={handleSubmit} variant='contained'>
          {selectedBook?.book_id ? 'Edit' : 'Create'}
        </Button>
      </Box>
    )
  }

  useEffect(() => {
    const { book_name, pages, price } = (selectedBook as BooksTypesResponse) ?? {}
    setBookType({ book_name, pages, price })
  }, [selectedBook])

  const handleChange = (prop: keyof BookTypeRequest) => (event: ChangeEvent<HTMLInputElement>) => {
    setBookType({ ...bookType, [prop]: event.target.value })
  }

  const resetFeesTypeDetails = () => {
    resetState()
    onClose()
  }

  return (
    <ChaarvyModal
      isOpen={isOpen}
      onClose={resetFeesTypeDetails}
      title={`${selectedBook?.book_id ? 'Edit' : 'Create'} Book`}
      footer={createBookFooter()}
      shouldWarnOnClose
      shouldRestrictCloseOnOuterClick
    >
      <>
        <Grid sm={12} md={8} lg={6} gap={2}>
          <TextField
            onChange={handleChange('book_name')}
            value={bookType.book_name}
            fullWidth
            id='book_name'
            label='Book Name'
            sx={{ marginBottom: 4 }}
          />
        </Grid>
        <Grid sm={12} md={8} lg={6} gap={2}>
          <TextField
            onChange={handleChange('pages')}
            value={bookType.pages}
            fullWidth
            id='pages'
            type='number'
            label='Pages'
            sx={{ marginBottom: 4 }}
          />
        </Grid>
        <Grid sm={12} md={8} lg={6} gap={2}>
          <TextField
            onChange={handleChange('price')}
            value={bookType.price}
            fullWidth
            id='price'
            type='number'
            label='Price'
            sx={{ marginBottom: 4 }}
          />
        </Grid>
      </>
    </ChaarvyModal>
  )
}

export default CreateOrUpdateBookModal
