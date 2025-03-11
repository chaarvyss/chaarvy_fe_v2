import { FormControl, MenuItem, Pagination, Select, SelectChangeEvent } from '@mui/material'
import { Box } from '@muiElements'
import React, { useEffect, useState } from 'react'
import { FilterProps } from 'src/lib/interfaces'

interface PaginationProps {
  total: number
  onChange: (data: FilterProps) => void
}

const ChaarvyPagination = ({ total, onChange }: PaginationProps) => {
  const [itemsPerPage, setItemsPerPage] = useState<number>(20)
  const [pageNumber, setPageNumber] = useState<number>(1)

  useEffect(() => {
    let offset = (pageNumber - 1) * itemsPerPage
    let limit = itemsPerPage
    onChange({ offset, limit })
  }, [itemsPerPage, pageNumber])

  if (!total) {
    total = 1
  }

  const handlePageSizeChange = (e: SelectChangeEvent<number>) => {
    setPageNumber(1)
    setItemsPerPage(Number(e.target.value))
  }

  return (
    <Box padding={5} display='flex' justifyContent='space-between' alignItems='center'>
      <FormControl>
        <small>Items per page</small>
        <Select size='small' id='pagination-select' value={itemsPerPage} onChange={handlePageSizeChange}>
          {[2, 5, 10, 20, 50, 100].map(each => (
            <MenuItem value={each}>{`${each}`}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Pagination
        count={Math.ceil(total / itemsPerPage)}
        page={pageNumber}
        color='primary'
        onChange={(_, value) => setPageNumber(value)}
      />
    </Box>
  )
}

export default ChaarvyPagination
