import { LoadingButton } from '@mui/lab'
import { Checkbox, FormControlLabel, TextField, Select, MenuItem, Tooltip } from '@mui/material'
import { ReactNode, useEffect, useState, MouseEvent } from 'react'

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

export type EditedDataTableOnSubmitPayload<T = any> = {
  created: T[]
  updated: T[]
  deleted: T[]
}

export interface ChaarvyDataTableProps<T = any> {
  columns: ChaarvyTableColumn<T>[]
  data: T[]
  getRowKey: (row: T, index: number) => string | number

  editable?: boolean
  onSubmit?: (payload: EditedDataTableOnSubmitPayload<T>) => void

  emptyMessage?: string
  hover?: boolean
  showColumnToggle?: boolean
  isLoading?: boolean
  loadingText?: string
  isSubmitting?: boolean
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
  isLoading = false,
  loadingText,
  isSubmitting = false
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
    setHistory([])
    setFuture([])
  }, [data])

  const handleCellChange = (rowIndex: number, columnId: string, value: any) => {
    setDraftData(prev => {
      // Push exact previous state to history before changing
      setHistory(h => [...h, prev])
      setFuture([])

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

      const newlyDeleted = originalData.filter(
        (origRow, oIndex) =>
          !last.some((draftRow, dIndex) => getRowKey(draftRow, dIndex) === getRowKey(origRow, oIndex))
      )
      setDeletedRows(newlyDeleted)

      return prev.slice(0, -1)
    })
  }

  const handleRedo = () => {
    setFuture(prev => {
      if (!prev.length) return prev
      const next = prev[prev.length - 1]

      setHistory(h => [...h, draftData])
      setDraftData(next)

      const newlyDeleted = originalData.filter(
        (origRow, oIndex) =>
          !next.some((draftRow, dIndex) => getRowKey(draftRow, dIndex) === getRowKey(origRow, oIndex))
      )
      setDeletedRows(newlyDeleted)

      return prev.slice(0, -1)
    })
  }

  const displayedColumns = columns.filter(col => visibleColumns[col.id])
  const open = Boolean(anchorEl)

  const handleAddRow = () => {
    const emptyRow: any = {}
    columns.forEach(col => {
      emptyRow[col.id] = ''
    })

    setDraftData(prev => {
      setHistory(h => [...h, prev])
      setFuture([])

      setEditingRows(prevEditing => ({
        ...prevEditing,
        [prev.length]: true
      }))

      return [...prev, emptyRow]
    })
  }

  const handleDeleteRow = (e: MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    setDraftData(prev => {
      setHistory(h => [...h, prev])
      setFuture([])

      const nextDraft = prev.filter((_, i) => i !== index)

      // Calculate deleted rows based on the guaranteed latest draft
      const newlyDeleted = originalData.filter(
        (origRow, oIndex) =>
          !nextDraft.some((draftRow, dIndex) => getRowKey(draftRow, dIndex) === getRowKey(origRow, oIndex))
      )
      setDeletedRows(newlyDeleted)

      return nextDraft
    })

    // Shift the editing boolean flags down so they stay with the correct rows
    setEditingRows(prev => {
      const nextEditing: Record<number, boolean> = {}
      Object.keys(prev).forEach(key => {
        const numKey = parseInt(key)
        if (numKey < index) nextEditing[numKey] = prev[numKey]
        if (numKey > index) nextEditing[numKey - 1] = prev[numKey]
      })

      return nextEditing
    })
  }

  const handleReset = () => {
    setDraftData(originalData)
    setDeletedRows([])
    setHistory([])
    setFuture([])
    setEditingRows({})
  }

  const toggleRowEdit = (e: MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const isRowChanged = (r1: T, r2: T) => JSON.stringify(r1) !== JSON.stringify(r2)

  const isNewRow = (row: T, index: number) => {
    return !originalData.find((o, oIdx) => getRowKey(o, oIdx) === getRowKey(row, index))
  }

  const isUpdatedRow = (row: T, index: number) => {
    const original = originalData.find((o, oIdx) => getRowKey(o, oIdx) === getRowKey(row, index))

    return original ? isRowChanged(row, original) : false
  }

  const getDiffPayload = () => {
    const created: T[] = []
    const updated: T[] = []

    draftData.forEach((row, index) => {
      const original = originalData.find((o, oIdx) => getRowKey(o, oIdx) === getRowKey(row, index))

      if (!original) created.push(row)
      else if (isRowChanged(row, original)) updated.push(row)
    })

    const deleted: T[] = deletedRows.map(row => ({ ...row, status: 0 }))

    return { created, updated, deleted }
  }

  const newRowBg = '#c3ffc8'
  const updatedRowBg = '#ffefaa'
  const deletedRowBg = '#ffebee'

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

            {deletedRows.length > 0 && (
              <ChaarvyFlex className={{ alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, backgroundColor: deletedRowBg, borderRadius: 1 }} />
                <Typography variant='body2'>Pending Deletions ({deletedRows.length})</Typography>
              </ChaarvyFlex>
            )}
          </ChaarvyFlex>

          <ChaarvyFlex className={{ alignItems: 'end' }}>
            <Tooltip title='Undo' placement='top'>
              <IconButton type='button' onClick={handleUndo} disabled={!history.length}>
                <GetChaarvyIcons iconName='Undo' fontSize='1.25rem' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Redo' placement='top'>
              <IconButton type='button' onClick={handleRedo} disabled={!future.length}>
                <GetChaarvyIcons iconName='Redo' fontSize='1.25rem' />
              </IconButton>
            </Tooltip>
          </ChaarvyFlex>
        </ChaarvyFlex>
      )}

      {showColumnToggle && (
        <Box sx={{ position: 'absolute', top: -5, right: 5 }}>
          <IconButton type='button' onClick={e => setAnchorEl(e.currentTarget)}>
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
                    <TableCell
                      key={col.id}
                      sx={{
                        textDecoration: row.status === 0 ? 'line-through' : 'none'
                      }}
                    >
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
                          <IconButton
                            type='button'
                            color={isRowEditing ? 'success' : 'warning'}
                            onClick={e => toggleRowEdit(e, index)}
                          >
                            <GetChaarvyIcons fontSize='1.25rem' iconName={isRowEditing ? 'Check' : 'Pencil'} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete' placement='top'>
                          <IconButton type='button' color='error' onClick={e => handleDeleteRow(e, index)}>
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
            <Typography>{isLoading ? (loadingText ?? 'Loading...') : emptyMessage}</Typography>
          </Box>
        )}
      </TableContainer>

      {editable && (
        <ChaarvyFlex className={{ flexDirection: 'column', alignItems: 'end', mt: 2 }}>
          <ChaarvyButton type='button' variant='text' onClick={handleAddRow}>
            Add New Row
          </ChaarvyButton>

          <ChaarvyFlex className={{ gap: 2, mt: 2 }}>
            <ChaarvyButton type='button' variant='outlined' size='small' onClick={handleReset}>
              Reset
            </ChaarvyButton>

            <LoadingButton
              type='button'
              loading={isSubmitting}
              variant='contained'
              size='small'
              onClick={() => onSubmit?.(getDiffPayload())}
              disabled={!Object.values(getDiffPayload()).find((arr: any) => arr.length > 0)}
            >
              Submit
            </LoadingButton>
          </ChaarvyFlex>
        </ChaarvyFlex>
      )}
    </Box>
  )
}

export default ChaarvyDataTable
