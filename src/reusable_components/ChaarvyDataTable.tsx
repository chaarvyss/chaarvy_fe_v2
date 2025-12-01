import { Checkbox, FormControlLabel } from '@mui/material'
import { ReactNode, useState } from 'react'

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@muiElements'
import GetChaarvyIcons from 'src/utils/icons'

export interface ChaarvyTableColumn<T = any> {
  id: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sticky?: boolean
  hideable?: boolean // Whether this column can be hidden by user
  defaultHidden?: boolean // Whether this column is hidden by default
  render?: (row: T, index: number) => ReactNode
  headerSx?: Record<string, any>
  cellSx?: Record<string, any>
}

export interface ChaarvyDataTableProps<T = any> {
  columns: ChaarvyTableColumn<T>[]
  data: T[]
  getRowKey: (row: T, index: number) => string | number
  onRowClick?: (row: T) => void
  emptyMessage?: string
  minWidth?: number
  ariaLabel?: string
  hover?: boolean
  showColumnToggle?: boolean // Show the column visibility toggle icon
}

const ChaarvyDataTable = <T extends Record<string, any>>({
  columns,
  data,
  getRowKey,
  onRowClick,
  emptyMessage = 'No data available',
  minWidth = 800,
  ariaLabel = 'table in dashboard',
  hover = true,
  showColumnToggle = true
}: ChaarvyDataTableProps<T>) => {
  // Initialize visible columns state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    columns.forEach(col => {
      initial[col.id] = !col.defaultHidden
    })

    return initial
  })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }))
  }

  // Filter columns based on visibility
  const displayedColumns = columns.filter(col => visibleColumns[col.id])

  // Check if column toggle should be shown (at least one hideable column exists)
  const hasHideableColumns = columns.some(col => col.hideable !== false)

  return (
    <TableContainer>
      {showColumnToggle && hasHideableColumns && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleMenuOpen} size='small' aria-label='toggle columns'>
            <GetChaarvyIcons iconName='ViewColumn' />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            {columns
              .filter(col => col.hideable !== false)
              .map(column => (
                <MenuItem key={column.id} onClick={() => handleColumnToggle(column.id)} sx={{ py: 0.5 }}>
                  <FormControlLabel
                    control={<Checkbox checked={visibleColumns[column.id]} size='small' />}
                    label={column.label}
                    sx={{ width: '100%', m: 0 }}
                  />
                </MenuItem>
              ))}
          </Menu>
        </Box>
      )}
      <Table sx={{ minWidth }} aria-label={ariaLabel}>
        <TableHead>
          <TableRow>
            {displayedColumns.map(column => (
              <TableCell
                key={column.id}
                align={column.align}
                width={column.width}
                sx={{
                  ...(column.sticky && {
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 1
                  }),
                  ...column.headerSx
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              hover={hover}
              key={getRowKey(row, index)}
              onClick={() => onRowClick?.(row)}
              sx={{
                ...(onRowClick && { cursor: 'pointer' }),
                '&:last-of-type td, &:last-of-type th': { border: 0 }
              }}
            >
              {displayedColumns.map(column => (
                <TableCell
                  key={`${getRowKey(row, index)}-${column.id}`}
                  align={column.align}
                  width={column.width}
                  sx={{
                    py: theme => `${theme.spacing(0.5)} !important`,
                    ...(column.sticky && {
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }),
                    ...column.cellSx
                  }}
                >
                  {column.render ? column.render(row, index) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length === 0 && (
        <Box justifyContent='center' alignItems='center' paddingBottom='2rem'>
          <Typography variant='h6' textAlign='center'>
            {emptyMessage}
          </Typography>
        </Box>
      )}
    </TableContainer>
  )
}

export default ChaarvyDataTable
