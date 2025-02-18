import React, { useEffect, useState } from 'react'
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@muiElements'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useLazyGetFeesTypesListQuery } from 'src/store/services/listServices'
import { TableHeaders } from 'src/lib/interfaces'
import { BooksTypesResponse, Fees } from 'src/lib/types'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import CreateOrUpdateBookModal, { BookTypeRequest } from './createBookModal'

const booksTypes: BooksTypesResponse[] = [
  {
    book_id: 'test-book',
    book_name: 'm-1',
    pages: 44,
    price: 250
  },
  {
    book_id: 'test-book2',
    book_name: 'm-2',
    pages: 84,
    price: 200
  }
]

const FeesTypes = () => {
  const [fetchFeesTypes, { data: getFeesTypes }] = useLazyGetFeesTypesListQuery()
  const [isBookModalOpen, setIsFeesTypeModalOpen] = useState<boolean>(false)
  const [selectedBook, setSelectedBook] = useState<BooksTypesResponse>()

  useEffect(() => {
    fetchFeesTypes()
  }, [])

  const handleOnModalClose = () => {
    setSelectedBook(undefined)
    setIsFeesTypeModalOpen(false)
  }

  const handleAddFees = () => {
    setIsFeesTypeModalOpen(true)
  }

  const handleKebabOptionClick = (Book: BooksTypesResponse, option: 'Edit') => {
    setSelectedBook(Book)
    switch (option) {
      case 'Edit':
        setIsFeesTypeModalOpen(true)
        break
    }
  }

  const getKebabOptions = (eachBook: BooksTypesResponse) => {
    return [
      {
        id: '',
        label: 'Edit',
        onOptionClick: () => handleKebabOptionClick(eachBook, 'Edit')
      }
    ]
  }

  const headers: TableHeaders[] = [
    { label: 'S#' },
    { label: 'Book Name' },
    { label: 'Pages' },
    { label: 'Price' },
    { label: 'Action', width: '100px' }
  ]
  return (
    <>
      <TableTilteHeader title='Books' buttonTitle='Add Book' onButtonClick={handleAddFees} />
      <Card>
        {(booksTypes ?? []).length > 0 ? (
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
                {(booksTypes ?? []).map((eachBook: BooksTypesResponse, index) => (
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{eachBook?.book_name}</TableCell>
                    <TableCell>{eachBook?.pages}</TableCell>
                    <TableCell>{eachBook?.price}</TableCell>

                    <TableCell>
                      <DropDownMenu dropDownMenuOptions={getKebabOptions(eachBook)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>No Books Available</Typography>
          </Box>
        )}
      </Card>
      <CreateOrUpdateBookModal isOpen={isBookModalOpen} selectedBook={selectedBook} onClose={handleOnModalClose} />
    </>
  )
}

export default FeesTypes
