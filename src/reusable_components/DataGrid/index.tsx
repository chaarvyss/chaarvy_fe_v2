import { Box, Chip, Typography } from '@mui/material'
import { AgGridReact, AgGridReactProps } from 'ag-grid-react'
import React, { useCallback, useState } from 'react'

export interface CustomDataGridProps extends AgGridReactProps {
  gridRef: React.RefObject<AgGridReact>
  height?: string | number
}

export const CustomDataGrid = ({ gridRef, height = '55vh', ...agGridProps }: CustomDataGridProps) => {
  const [hiddenColumns, setHiddenColumns] = useState<{ id: string; name: string; colIds: string[] }[]>([])

  const syncHiddenColumns = useCallback(() => {
    const columns = gridRef.current?.api.getColumns()
    if (!columns) return

    const hiddenMap = new Map<string, { id: string; name: string; colIds: string[] }>()

    columns
      .filter(col => !col.isVisible())
      .forEach(col => {
        const groups: string[] = []
        let parent = col.getParent()
        while (parent) {
          if (parent.getColGroupDef()?.headerName) groups.unshift(parent.getColGroupDef()!.headerName!)
          parent = parent.getParent()
        }

        const colId = col.getColId()
        for (let level = 1; level <= groups.length + 1; level++) {
          const path = level <= groups.length ? groups.slice(0, level) : [...groups, col.getColDef()?.headerName]
          const key = path.join('__')

          if (!hiddenMap.has(key)) {
            hiddenMap.set(key, { id: key, name: path.join(' > '), colIds: [] })
          }
          hiddenMap.get(key)!.colIds.push(colId)
        }
      })

    const values = Array.from(hiddenMap.values())
    values.forEach(item => {
      item.colIds = [...new Set(item.colIds)]
    })

    setHiddenColumns(
      values.filter(
        item =>
          !values.some(
            other => other !== item && other.id.startsWith(item.id + '__') && other.colIds.length === item.colIds.length
          )
      )
    )
  }, [gridRef])

  return (
    <>
      {hiddenColumns.length > 0 && (
        <Box
          mb={2}
          display='flex'
          gap={1.5}
          flexWrap='wrap'
          alignItems='center'
          sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}
        >
          <Typography variant='body2' fontWeight={600} color='text.secondary'>
            Hidden Segments:
          </Typography>
          {hiddenColumns.map(column => (
            <Chip
              key={column.id}
              label={column.name}
              color='primary'
              variant='outlined'
              onClick={() => gridRef.current?.api?.setColumnsVisible(column.colIds, true)}
              onDelete={() => gridRef.current?.api?.setColumnsVisible(column.colIds, true)}
            />
          ))}
        </Box>
      )}
      <Box className='ag-theme-alpine' sx={{ height, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          onColumnVisible={syncHiddenColumns}
          onColumnMoved={syncHiddenColumns}
          suppressDragLeaveHidesColumns={false}
          defaultColDef={{ resizable: true, sortable: false, filter: false }}
          undoRedoCellEditing
          undoRedoCellEditingLimit={100}
          {...agGridProps}
        />
      </Box>
    </>
  )
}
