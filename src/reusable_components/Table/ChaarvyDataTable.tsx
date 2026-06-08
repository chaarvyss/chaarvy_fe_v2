import { LoadingButton } from '@mui/lab'
import { Checkbox, FormControlLabel, TextField, Select, MenuItem, Tooltip } from '@mui/material'
import { useEffect, useState, MouseEvent, useRef, useCallback } from 'react'
import { ClipLoader } from 'react-spinners'

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
  showDefaultEntryButton?: boolean
  defaultEntryData?: T[]
  shouldHideActions?: boolean

  // --- NEW: Infinite Scroll Props ---
  hasMore?: boolean
  onLoadMore?: () => void
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
  isSubmitting = false,
  showDefaultEntryButton = false,
  defaultEntryData,
  shouldHideActions = false,
  hasMore = false,
  onLoadMore
}: ChaarvyDataTableProps<T>) => {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const [draftData, setDraftData] = useState<T[]>(data)
  const [originalData, setOriginalData] = useState<T[]>(data)
  const [deletedRows, setDeletedRows] = useState<T[]>([])
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)

  const [history, setHistory] = useState<T[][]>([])
  const [future, setFuture] = useState<T[][]>([])

  const [isDefaultDataSet, setIsDefaultDataSet] = useState(false)

  // --- NEW: Intersection Observer for Infinite Scroll ---
  const observer = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      // Don't trigger if it's currently loading, if there's no more data, or if we are in editable mode
      if (isLoading || editable || !hasMore || !onLoadMore) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      })

      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore, onLoadMore, editable]
  )

  useEffect(() => {
    if (!isLoading) {
      setIsDefaultDataSet(false)
    }
  }, [isLoading])

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
    setEditingRowIndex(null)
    setHistory([])
    setFuture([])
  }, [data])

  const handleDefaultEntryClick = () => {
    setDraftData(defaultEntryData ?? [])
    setIsDefaultDataSet(true)
  }

  const handleCellChange = (rowIndex: number, columnId: string, value: any) => {
    setDraftData(prev => {
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
      if (col.inputType === 'checkbox') emptyRow[col.id] = false
      else emptyRow[col.id] = ''
    })

    setDraftData(prev => {
      setHistory(h => [...h, prev])
      setFuture([])

      setEditingRowIndex(prev.length)

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

      const newlyDeleted = originalData.filter(
        (origRow, oIndex) =>
          !nextDraft.some((draftRow, dIndex) => getRowKey(draftRow, dIndex) === getRowKey(origRow, oIndex))
      )
      setDeletedRows(newlyDeleted)

      return nextDraft
    })

    setEditingRowIndex(prev => {
      if (prev === index) return null
      if (prev !== null && prev > index) return prev - 1

      return prev
    })
  }

  const handleReset = () => {
    setDraftData(originalData)
    setDeletedRows([])
    setHistory([])
    setFuture([])
    setEditingRowIndex(null)
    setIsDefaultDataSet(false)
  }

  const toggleRowEdit = (e: MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    setEditingRowIndex(prev => (prev === index ? null : index))
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

  const newRowBg = editable ? '#c3ffc8' : 'fff'
  const updatedRowBg = editable ? '#ffefaa' : 'fff'
  const deletedRowBg = editable ? '#ffebee' : 'fff'

  const getIsEditableCell = (row: T, col: ChaarvyTableColumn, isRowEditing: boolean) => {
    if (col.readonly) return false
    if (col.inputType === 'checkbox' && col.editable) return true

    return isRowEditing && col.editable && (col.inputType !== 'select' || row.restrictEdit !== true)
  }

  const getIsReadonlyEditCell = (row: T, col: ChaarvyTableColumn, isRowEditing: boolean) => {
    return isRowEditing && col.readonly
  }

  const getAvailableOptions = (col: ChaarvyTableColumn, rowIndex: number) => {
    if (!col.uniqueOptionsOnly) return col.options || []
    const usedValues = draftData.filter((_, i) => i !== rowIndex).map(row => row[col.id])

    return (col.options || []).filter(opt => {
      if (opt.value === draftData[rowIndex][col.id]) return true

      return !usedValues.includes(opt.value)
    })
  }

  const canAddNewRow = () => {
    return columns.every(col => {
      if (col.inputType !== 'select' || !col.uniqueOptionsOnly) return true

      const usedValues = draftData.map(row => row[col.id])

      const availableOptions = (col.options || []).filter(opt => !usedValues.includes(opt.value))

      return availableOptions.length > 0
    })
  }

  const hidebleColumns = columns.filter(col => col.hideable)
  const hadChanges = Object.values(getDiffPayload()).find((arr: any) => arr.length > 0)
  const totalColumnsCount = displayedColumns.length + (editable && !shouldHideActions ? 1 : 0)

  return (
    <Box position='relative' borderRadius={1} padding={2}>
      {editable && (
        <ChaarvyFlex className={{ justifyContent: 'space-between', mb: 5, mt: 5 }}>
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
            {showDefaultEntryButton && !isDefaultDataSet && (
              <ChaarvyButton color='info' onClick={handleDefaultEntryClick} size='small'>
                Set Default data
              </ChaarvyButton>
            )}
            <Tooltip title='Undo' placement='top'>
              <span style={{ display: 'inline-flex' }}>
                <IconButton type='button' onClick={handleUndo} disabled={!history.length}>
                  <GetChaarvyIcons iconName='Undo' fontSize='1.25rem' />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title='Redo' placement='top'>
              <span style={{ display: 'inline-flex' }}>
                <IconButton type='button' onClick={handleRedo} disabled={!future.length}>
                  <GetChaarvyIcons iconName='Redo' fontSize='1.25rem' />
                </IconButton>
              </span>
            </Tooltip>
          </ChaarvyFlex>
        </ChaarvyFlex>
      )}

      {showColumnToggle && (
        <Box sx={{ position: 'absolute', top: 5, zIndex: 5, right: 5 }}>
          <Tooltip title='Show/Hide Columns' placement='top'>
            <IconButton type='button' onClick={e => setAnchorEl(e.currentTarget)}>
              {hidebleColumns.length > 0 && <GetChaarvyIcons iconName='ViewColumn' color='primary' />}
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            {hidebleColumns.map(column => (
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
          overflow: 'auto',
          borderRadius: 1,
          position: 'relative'
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

              {editable && !shouldHideActions && (
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
              const isRowEditing = editingRowIndex === index
              const firstEditableColumnId = displayedColumns.find(col => getIsEditableCell(row, col, isRowEditing))?.id

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
                      {getIsEditableCell(row, col, isRowEditing) || getIsReadonlyEditCell(row, col, isRowEditing) ? (
                        col.inputType === 'select' ? (
                          <Select
                            value={row[col.id]}
                            onChange={e => handleCellChange(index, col.id, e.target.value)}
                            size='small'
                            fullWidth
                            disabled={getIsReadonlyEditCell(row, col, isRowEditing)}
                            autoFocus={col.id === firstEditableColumnId}
                            sx={getIsReadonlyEditCell(row, col, isRowEditing) ? { cursor: 'not-allowed' } : undefined}
                          >
                            {getAvailableOptions(col, index).map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : col.inputType === 'checkbox' ? (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(row[col.id])}
                                onChange={e => handleCellChange(index, col.id, e.target.checked)}
                                size='small'
                                disabled={getIsReadonlyEditCell(row, col, isRowEditing)}
                                autoFocus={col.id === firstEditableColumnId}
                                sx={
                                  getIsReadonlyEditCell(row, col, isRowEditing) ? { cursor: 'not-allowed' } : undefined
                                }
                              />
                            }
                            label={col.inputLabel ?? ''}
                          />
                        ) : (
                          <TextField
                            type={col.inputType || 'text'}
                            value={row[col.id]}
                            onChange={e => handleCellChange(index, col.id, e.target.value)}
                            size='small'
                            fullWidth
                            autoFocus={col.id === firstEditableColumnId}
                            disabled={getIsReadonlyEditCell(row, col, isRowEditing)}
                            sx={getIsReadonlyEditCell(row, col, isRowEditing) ? { cursor: 'not-allowed' } : undefined}
                          />
                        )
                      ) : col.render ? (
                        col.render(row, index)
                      ) : col.inputType === 'select' ? (
                        (col.options?.find(opt => opt.value === row[col.id])?.label ?? '')
                      ) : col.inputType === 'checkbox' ? (
                        <FormControlLabel
                          control={<Checkbox checked={Boolean(row[col.id])} disabled size='small' />}
                          label={col.inputLabel ?? ''}
                        />
                      ) : (
                        row[col.id]
                      )}
                    </TableCell>
                  ))}

                  {editable && !shouldHideActions && (
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

            {/* --- NEW: Invisible Tripwire for Infinite Scroll --- */}
            {!editable && hasMore && (
              <TableRow ref={lastElementRef}>
                <TableCell colSpan={totalColumnsCount} align='center' sx={{ borderBottom: 'none', py: 3 }}>
                  {isLoading ? (
                    <ClipLoader color={'#1976d2'} size={25} />
                  ) : (
                    <Typography variant='caption' color='textSecondary'>
                      Scroll to load more
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {draftData.length === 0 && !hasMore && (
          <Box
            sx={{
              height: screen.availHeight - 530,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ClipLoader
              color={'#1976d2'}
              loading={isLoading}
              size={35}
              aria-label='Loading Spinner'
              data-testid='loader'
            />
            <Typography>{isLoading ? (loadingText ?? 'Loading...') : emptyMessage}</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Legacy loader box (Only shows if not using infinite scroll to prevent duplicate spinners) */}
      {draftData.length > 0 && isLoading && !hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90%', mt: 2 }}>
          <ClipLoader
            color={'#1976d2'}
            loading={isLoading}
            size={35}
            aria-label='Loading Spinner'
            data-testid='loader'
          />
        </Box>
      )}

      {editable && (
        <ChaarvyFlex className={{ flexDirection: 'column', alignItems: 'end', mt: 2 }}>
          {canAddNewRow() && !isLoading && (
            <ChaarvyButton type='button' variant='text' onClick={handleAddRow}>
              Add New Row
            </ChaarvyButton>
          )}

          <ChaarvyFlex className={{ gap: 2, mt: 2 }}>
            {hadChanges && (
              <ChaarvyButton type='button' variant='outlined' size='small' onClick={handleReset}>
                Reset
              </ChaarvyButton>
            )}

            <LoadingButton
              type='button'
              loading={isSubmitting}
              variant='contained'
              size='small'
              onClick={() => onSubmit?.(getDiffPayload())}
              disabled={!hadChanges}
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
