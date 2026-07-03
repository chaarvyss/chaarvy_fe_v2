import { Card, FormControl, MenuItem, Pagination, Select, SelectChangeEvent } from '@mui/material'
import React, { useEffect, useState } from 'react'

export interface PaginationProps {
  total: number
  onChange: (data: FilterProps) => void
}

const ChaarvyPagination = ({ total, onChange }: PaginationProps) => {
  const [itemsPerPage, setItemsPerPage] = useState<number>(20)
  const [pageNumber, setPageNumber] = useState<number>(1)

  useEffect(() => {
    const offset = (pageNumber - 1) * itemsPerPage
    const limit = itemsPerPage
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
    <Card
      id='pagination-container'
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 3,
        width: '100%'
      }}
    >
      <FormControl sx={{ gap: 1 }}>
        {/* <small>Items per page</small> */}
        <Select
          size='small'
          id='pagination-select'
          value={itemsPerPage}
          onChange={handlePageSizeChange}
          placeholder='Limit'
        >
          {[2, 5, 10, 20, 50, 100].map(each => (
            <MenuItem key={each} value={each}>{`${each}`}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Pagination
        count={Math.ceil(total / itemsPerPage)}
        page={pageNumber}
        color='primary'
        onChange={(_, value) => setPageNumber(value)}
      />
    </Card>
  )
}

export default ChaarvyPagination
