import { Checkbox, FormControlLabel, TextField, Select, MenuItem, Tooltip } from '@mui/material'
import { ReactNode, useEffect, useState } from 'react'

import {
  Box,
  IconButton,
  Menu,
  MenuItem as MuiMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@muiElements'
import GetChaarvyIcons from 'src/utils/icons'

import ChaarvyButton from '../ChaarvyButton'
import ChaarvyFlex from '../chaarvyFlex'

export interface ChaarvyTableColumn<T = any> {
  id: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  hideable?: boolean
  defaultHidden?: boolean
  editable?: boolean
  inputType?: 'text' | 'number' | 'select'
  options?: { label: string; value: any }[]
  render?: (row: T, index: number) => ReactNode
  headerSx?: Record<string, any>
  cellSx?: Record<string, any>
}

export interface ChaarvyDataTableProps<T = any> {
  columns: ChaarvyTableColumn<T>[]
  data: T[]
  getRowKey: (row: T, index: number) => string | number

  editable?: boolean
  onSubmit?: (payload: { created: T[]; updated: T[]; deleted: (string | number)[] }) => void

  emptyMessage?: string
  hover?: boolean
  showColumnToggle?: boolean
  isLoading?: boolean
}

const ChaarvyDataTable = <T extends Record<string, any>>({
  columns,
  data,
  getRowKey,
  editable = false,
  onSubmit,
  emptyMessage = 'No data available',
  hover = true,
  showColumnToggle = true,
  isLoading = false
}: ChaarvyDataTableProps<T>) => {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const [draftData, setDraftData] = useState<T[]>(data)
  const [originalData, setOriginalData] = useState<T[]>(data)
  const [deletedRows, setDeletedRows] = useState<T[]>([])
  const [editingRows, setEditingRows] = useState<Record<number, boolean>>({})

  const [history, setHistory] = useState<T[][]>([])
  const [future, setFuture] = useState<T[][]>([])

  useEffect(() => {
    const visible: Record<string, boolean> = {}
    columns.forEach(col => {
      visible[col.id] = !col.defaultHidden
    })
    setVisibleColumns(visible)
  }, [columns])

  useEffect(() => {
    setDraftData(data)
    setOriginalData(data)
    setDeletedRows([])
    setEditingRows({})
  }, [data])

  const pushToHistory = () => {
    setHistory(prev => [...prev, draftData])
    setFuture([])
  }

  const handleCellChange = (rowIndex: number, columnId: string, value: any) => {
    pushToHistory()
    setDraftData(prev => {
      const updated = [...prev]
      updated[rowIndex] = {
        ...updated[rowIndex],
        [columnId]: value
      }

      return updated
    })
  }

  const handleUndo = () => {
    setHistory(prev => {
      if (!prev.length) return prev
      const last = prev[prev.length - 1]

      setFuture(f => [...f, draftData])
      setDraftData(last)

      return prev.slice(0, -1)
    })
  }

  const handleRedo = () => {
    setFuture(prev => {
      if (!prev.length) return prev
      const next = prev[prev.length - 1]

      setHistory(h => [...h, draftData])
      setDraftData(next)

      return prev.slice(0, -1)
    })
  }

  const displayedColumns = columns.filter(col => visibleColumns[col.id])
  const open = Boolean(anchorEl)

  const handleAddRow = () => {
    pushToHistory()
    const emptyRow: any = {}
    columns.forEach(col => {
      emptyRow[col.id] = ''
    })

    setDraftData(prev => [...prev, emptyRow])
    setEditingRows(prev => ({
      ...prev,
      [draftData.length]: true
    }))
  }

  const handleDeleteRow = (index: number) => {
    pushToHistory()
    setDraftData(prev => {
      const row = prev[index]

      const existsInOriginal = originalData.find(o => getRowKey(o, index) === getRowKey(row, index))

      if (existsInOriginal) {
        setDeletedRows(d => [...d, row])
      }

      return prev.filter((_, i) => i !== index)
    })
  }

  const toggleRowEdit = (index: number) => {
    setEditingRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const isRowChanged = (r1: T, r2: T) => JSON.stringify(r1) !== JSON.stringify(r2)

  const isNewRow = (row: T, index: number) => {
    return !originalData.find(o => getRowKey(o, index) === getRowKey(row, index))
  }

  const isUpdatedRow = (row: T, index: number) => {
    const original = originalData.find(o => getRowKey(o, index) === getRowKey(row, index))

    return original ? isRowChanged(row, original) : false
  }

  const getDiffPayload = () => {
    const created: T[] = []
    const updated: T[] = []

    draftData.forEach((row, index) => {
      const original = originalData.find(o => getRowKey(o, index) === getRowKey(row, index))

      if (!original) created.push(row)
      else if (isRowChanged(row, original)) updated.push(row)
    })

    const deleted = deletedRows.map(row => getRowKey(row, 0))

    return { created, updated, deleted }
  }

  const newRowBg = '#c3ffc8'
  const updatedRowBg = '#ffefaa'

  return (
    <Box>
      {editable && (
        <ChaarvyFlex className={{ justifyContent: 'space-between', mb: 5 }}>
          <ChaarvyFlex className={{ alignItems: 'end', gap: 3 }}>
            <ChaarvyFlex className={{ alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: newRowBg, borderRadius: 1 }} />
              <Typography variant='body2'>New Rows</Typography>
            </ChaarvyFlex>

            <ChaarvyFlex className={{ alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: updatedRowBg, borderRadius: 1 }} />
              <Typography variant='body2'>Updated Rows</Typography>
            </ChaarvyFlex>
          </ChaarvyFlex>

          <ChaarvyFlex className={{ alignItems: 'end' }}>
            <Tooltip title='Undo' placement='top'>
              <IconButton onClick={handleUndo} disabled={!history.length}>
                <GetChaarvyIcons iconName='Undo' fontSize='1.25rem' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Redo' placement='top'>
              <IconButton onClick={handleRedo} disabled={!future.length}>
                <GetChaarvyIcons iconName='Redo' fontSize='1.25rem' />
              </IconButton>
            </Tooltip>
          </ChaarvyFlex>
        </ChaarvyFlex>
      )}

      {showColumnToggle && (
        <Box sx={{ position: 'absolute', top: -5, right: 5 }}>
          <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
            <GetChaarvyIcons iconName='ViewColumn' />
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            {columns.map(column => (
              <MuiMenuItem key={column.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visibleColumns[column.id]}
                      onChange={() =>
                        setVisibleColumns(prev => ({
                          ...prev,
                          [column.id]: !prev[column.id]
                        }))
                      }
                    />
                  }
                  label={column.label}
                />
              </MuiMenuItem>
            ))}
          </Menu>
        </Box>
      )}

      <TableContainer
        sx={{
          maxHeight: 400,
          overflow: 'auto',
          border: '1px solid #eee',
          borderRadius: 1
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {displayedColumns.map(col => (
                <TableCell
                  key={col.id}
                  sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 2
                  }}
                >
                  {col.label}
                </TableCell>
              ))}

              {editable && (
                <TableCell
                  align='right'
                  sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 2
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {draftData.map((row, index) => {
              const isRowEditing = editingRows[index]

              return (
                <TableRow
                  key={getRowKey(row, index)}
                  hover={hover}
                  sx={{
                    backgroundColor: isNewRow(row, index)
                      ? newRowBg
                      : isUpdatedRow(row, index)
                        ? updatedRowBg
                        : 'inherit'
                  }}
                >
                  {displayedColumns.map(col => (
                    <TableCell key={col.id}>
                      {isRowEditing && col.editable ? (
                        col.inputType === 'select' ? (
                          <Select
                            value={row[col.id]}
                            onChange={e => handleCellChange(index, col.id, e.target.value)}
                            size='small'
                            fullWidth
                          >
                            {col.options?.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <TextField
                            type={col.inputType || 'text'}
                            value={row[col.id]}
                            onChange={e => handleCellChange(index, col.id, e.target.value)}
                            size='small'
                            fullWidth
                          />
                        )
                      ) : col.render ? (
                        col.render(row, index)
                      ) : (
                        row[col.id]
                      )}
                    </TableCell>
                  ))}

                  {editable && (
                    <TableCell align='right'>
                      <ChaarvyFlex className={{ justifyContent: 'end' }}>
                        <Tooltip title={isRowEditing ? 'Save' : 'Edit'} placement='top'>
                          <IconButton color={isRowEditing ? 'success' : 'warning'} onClick={() => toggleRowEdit(index)}>
                            <GetChaarvyIcons fontSize='1.25rem' iconName={isRowEditing ? 'Check' : 'Pencil'} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete' placement='top'>
                          <IconButton color='error' onClick={() => handleDeleteRow(index)}>
                            <GetChaarvyIcons fontSize='1.25rem' iconName='Delete' />
                          </IconButton>
                        </Tooltip>
                      </ChaarvyFlex>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {draftData.length === 0 && (
          <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>{isLoading ? 'Loading...' : emptyMessage}</Typography>
          </Box>
        )}
      </TableContainer>

      {editable && (
        <ChaarvyFlex className={{ flexDirection: 'column', alignItems: 'end', mt: 2 }}>
          <ChaarvyButton variant='text' onClick={handleAddRow}>
            Add New Row
          </ChaarvyButton>

          <ChaarvyFlex className={{ gap: 2, mt: 2 }}>
            <ChaarvyButton variant='outlined' size='small' onClick={() => setDraftData(data)}>
              Reset
            </ChaarvyButton>

            <ChaarvyButton variant='contained' size='small' onClick={() => onSubmit?.(getDiffPayload())}>
              Submit
            </ChaarvyButton>
          </ChaarvyFlex>
        </ChaarvyFlex>
      )}
    </Box>
  )
}

export default ChaarvyDataTable
