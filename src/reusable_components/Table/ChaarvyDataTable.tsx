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
  hideable?: boolean
  defaultHidden?: boolean
  freezable?: boolean // Whether this column can be frozen by user (click header to freeze)
  defaultFrozen?: boolean // Whether this column is frozen by default
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
  ariaLabel?: string
  hover?: boolean
  showColumnToggle?: boolean
}

const ChaarvyDataTable = <T extends Record<string, any>>({
  columns,
  data,
  getRowKey,
  onRowClick,
  emptyMessage = 'No data available',
  ariaLabel = 'table in dashboard',
  hover = true,
  showColumnToggle = true
}: ChaarvyDataTableProps<T>) => {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    columns.forEach(col => {
      initial[col.id] = !col.defaultHidden
    })

    return initial
  })

  // Initialize frozen columns state
  const [frozenColumns, setFrozenColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    columns.forEach(col => {
      initial[col.id] = col.defaultFrozen || false
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

  const handleColumnFreeze = (columnId: string) => {
    setFrozenColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }))
  }

  // Filter columns based on visibility
  const displayedColumns = columns.filter(col => visibleColumns[col.id])

  // Compute left positions for frozen columns
  const isFrozen = (colId: string) => frozenColumns[colId]

  const frozenPositions = displayedColumns.reduce(
    (acc, col) => {
      if (!isFrozen(col.id)) {
        acc[col.id] = 0

        return acc
      }
      let position = 0
      for (let i = 0; i < displayedColumns.length; i++) {
        if (displayedColumns[i].id === col.id) break
        if (isFrozen(displayedColumns[i].id)) {
          const w = displayedColumns[i].width
          position += typeof w === 'string' ? parseInt(w) : w || 150
        }
      }
      acc[col.id] = position

      return acc
    },
    {} as Record<string, number>
  )

  const hasHideableColumns = columns.some(col => col.hideable !== false)

  const computedMinWidth = displayedColumns.reduce((total, col) => {
    if (col.width) {
      const widthNum = typeof col.width === 'string' ? parseInt(col.width) : (col.width as number)

      return total + widthNum
    }

    return total + 150
  }, 50)

  const finalMinWidth = Math.max(computedMinWidth, 300)

  return (
    <Box sx={{ position: 'relative' }}>
      {showColumnToggle && hasHideableColumns && (
        <Box sx={{ position: 'absolute', top: -5, right: 5, zIndex: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleMenuOpen} size='small' aria-label='toggle columns'>
              <GetChaarvyIcons iconName='ViewColumn' />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              {columns
                .filter(col => col.hideable !== false)
                .map(column => (
                  <MenuItem key={column.id} sx={{ py: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visibleColumns[column.id]}
                          size='small'
                          onChange={() => handleColumnToggle(column.id)}
                        />
                      }
                      label={column.label}
                      onClick={() => handleColumnToggle(column.id)}
                      sx={{ width: '100%', m: 0 }}
                    />
                  </MenuItem>
                ))}
            </Menu>
          </Box>
        </Box>
      )}
      <TableContainer>
        <Table sx={{ minWidth: finalMinWidth }} aria-label={ariaLabel}>
          <TableHead>
            <TableRow>
              {displayedColumns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  width={column.width}
                  onClick={() => column.freezable && handleColumnFreeze(column.id)}
                  sx={{
                    ...(isFrozen(column.id) && {
                      position: 'sticky',
                      left: frozenPositions[column.id],
                      backgroundColor: 'background.paper',
                      zIndex: 11,
                      boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)'
                    }),
                    ...(!isFrozen(column.id) && {
                      backgroundColor: 'background.paper'
                    }),
                    ...(column.freezable && { cursor: 'pointer', userSelect: 'none' }),
                    ...column.headerSx
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {column.label}
                    {column.freezable && (
                      <GetChaarvyIcons
                        iconName={isFrozen(column.id) ? 'LockOutline' : 'LockOpenOutline'}
                        fontSize='1.25rem'
                      />
                    )}
                  </Box>
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
                      ...(isFrozen(column.id) && {
                        position: 'sticky',
                        left: frozenPositions[column.id],
                        backgroundColor: 'background.paper',
                        zIndex: 1,
                        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)'
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
    </Box>
  )
}

export default ChaarvyDataTable
