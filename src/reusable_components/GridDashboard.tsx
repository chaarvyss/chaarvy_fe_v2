import { Paper, Typography, Box, TextField, IconButton, Stack } from '@mui/material'
import type { GridStack } from 'gridstack'
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import 'gridstack/dist/gridstack.min.css'

import { isAuthorised } from 'src/lib/util/permissionCheck'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

// Exporting the interface so consuming pages can use it
export interface LayoutCard {
  i: string
  x: number
  y: number
  w: number
  h: number
  shouldHide: boolean
  hadSearch: boolean
  permission_key: string
}

type DashboardCardProps = {
  hadSearch: boolean
  searchValue?: string
  onSearch?: (value: string) => void
  item: LayoutCard
  title: string
  onRemove: (id: string) => void
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

// The draggable card wrapper
const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ item, title, onRemove, children, searchValue = '', hadSearch, onSearch, ...rest }, ref) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <div
        ref={ref}
        className='grid-stack-item'
        gs-id={item.i}
        gs-x={item.x}
        gs-y={item.y}
        gs-w={item.w}
        gs-h={item.h}
        {...rest}
      >
        <div
          className='grid-stack-item-content'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Paper
            elevation={3}
            className='p-3'
            style={{
              position: 'relative',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {isHovered && (
              <IconButton
                onClick={() => onRemove(item.i)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 5,
                  width: '10px',
                  padding: '4px 8px',
                  zIndex: 10
                }}
              >
                <GetChaarvyIcons iconName={ChaarvyIcon.Close} fontSize='1.25rem' color='error' />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginRight: '35px' }}>
              <Typography variant='h6' className='drag-handle' style={{ cursor: 'grab', marginBottom: '8px' }}>
                {title}
              </Typography>
              {hadSearch && (
                <TextField
                  placeholder='Search'
                  value={searchValue}
                  onChange={e => onSearch?.(e.target.value)}
                  size='small'
                />
              )}
            </Box>
            <div style={{ flexGrow: 1, overflow: 'auto' }}>{children}</div>
          </Paper>
        </div>
      </div>
    )
  }
)

interface GridDashboardProps {
  storageKey: string // Unique key per page/route (e.g., 'admin_dash', 'transport_dash')
  defaultLayout: LayoutCard[]
  componentsMap: { [key: string]: React.ElementType }
}

export const GridDashboard: React.FC<GridDashboardProps> = ({ storageKey, defaultLayout, componentsMap }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<GridStack | null>(null)

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  // Create a unique key for local storage based on the route/page
  const localStorageKey = `dashLayout_${storageKey}`

  const [layout, setLayout] = useState<LayoutCard[]>([])
  const [isGridReady, setIsGridReady] = useState(false)

  // Initialization & LocalStorage merge
  useEffect(() => {
    const customizedLayout = localStorage.getItem(localStorageKey)
    if (customizedLayout) {
      const parsedSavedLayout = JSON.parse(customizedLayout)
      const mergedLayout = defaultLayout.map(defItem => {
        const savedItem = parsedSavedLayout.find((s: LayoutCard) => s.i === defItem.i)

        return savedItem ? { ...defItem, ...savedItem } : defItem
      })
      setLayout(mergedLayout)
    } else {
      setLayout(defaultLayout)
      localStorage.setItem(localStorageKey, JSON.stringify(defaultLayout))
    }
    setIsGridReady(true)
  }, [defaultLayout, localStorageKey])

  // GridStack Initialization and Event Syncing
  useEffect(() => {
    if (!isGridReady || !containerRef.current) return

    const gridEl = containerRef.current

    const timer = setTimeout(async () => {
      const { GridStack: GridStackLib } = await import('gridstack')

      if (!gridRef.current) {
        gridRef.current = GridStackLib.init(
          {
            column: 12,
            cellHeight: 100,
            margin: 16,
            float: false,
            handle: '.drag-handle',
            animate: true
          },
          gridEl
        )

        gridRef.current.on('change', (event: Event, items: any) => {
          if (!items) return
          setLayout(prevLayout => {
            const updatedLayout = [...prevLayout]
            items.forEach((item: any) => {
              const idx = updatedLayout.findIndex(u => u.i === item.id)
              if (idx > -1) {
                updatedLayout[idx] = {
                  ...updatedLayout[idx],
                  x: item.x,
                  y: item.y,
                  w: item.w,
                  h: item.h
                }
              }
            })
            localStorage.setItem(localStorageKey, JSON.stringify(updatedLayout))

            return updatedLayout
          })
        })
      } else {
        const uninitializedWidgets = gridEl.querySelectorAll('.grid-stack-item:not(.ui-draggable)')
        uninitializedWidgets.forEach(el => {
          gridRef.current?.makeWidget(el as HTMLElement)
        })
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [layout, isGridReady, localStorageKey])

  const handleRemoveComponent = useCallback(
    (id: string) => {
      const el = document.querySelector(`[gs-id="${id}"]`)
      if (el && gridRef.current) gridRef.current.removeWidget(el as HTMLElement, false)

      setLayout(prevLayout => {
        const nextLayout = prevLayout.map(item => (item.i === id ? { ...item, shouldHide: true } : item))
        localStorage.setItem(localStorageKey, JSON.stringify(nextLayout))

        return nextLayout
      })
    },
    [localStorageKey]
  )

  const handleRestoreComponent = useCallback(
    (id: string) => {
      setLayout(prevLayout => {
        const nextLayout = prevLayout.map(item => (item.i === id ? { ...item, shouldHide: false } : item))
        localStorage.setItem(localStorageKey, JSON.stringify(nextLayout))

        return nextLayout
      })
    },
    [localStorageKey]
  )

  const handleResetDashboard = () => {
    if (gridRef.current) {
      gridRef.current.destroy(false)
      gridRef.current = null
    }
    setLayout(defaultLayout)
    localStorage.setItem(localStorageKey, JSON.stringify(defaultLayout))
  }

  const availableHiddenWidgets = layout.filter(
    item => item.shouldHide && isAuthorised(item.permission_key) && item.i !== 'greetingCard'
  )

  const hasContent = useMemo(() => {
    return layout.some(item => item.shouldHide === false && isAuthorised(item.permission_key) === true)
  }, [layout])

  if (!hasContent && availableHiddenWidgets.length == 0) {
    return (
      <Stack direction='column' justifyContent='center' alignItems='center' height='30vh'>
        <Typography>{layout.length == 0 ? 'Loading...' : 'No items to show'}</Typography>
      </Stack>
    )
  }

  return (
    <div className='container-fluid' style={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {availableHiddenWidgets.length > 0 && (
            <Typography variant='body2' sx={{ alignSelf: 'center', mr: 1, color: 'text.secondary' }}>
              Hidden Widgets:
            </Typography>
          )}
          {availableHiddenWidgets.map(widget => (
            <ChaarvyButton
              key={widget.i}
              size='small'
              variant='outlined'
              onClick={() => handleRestoreComponent(widget.i)}
            >
              + Add {widget.i.replace(/_/g, ' ')}
            </ChaarvyButton>
          ))}
        </Box>

        <ChaarvyButton size='small' variant='outlined' color='primary' onClick={handleResetDashboard}>
          <GetChaarvyIcons iconName={ChaarvyIcon.Undo} fontSize='1.25rem' /> Reset
        </ChaarvyButton>
      </Box>

      <div className='grid-stack' ref={containerRef}>
        {layout.map(item => {
          if (item.shouldHide || !isAuthorised(item.permission_key)) return null
          const Component = componentsMap[item.i]
          const currentSearchText = searchQueries[item.i] || '' // Grab the specific text for this widget

          return (
            <DashboardCard
              hadSearch={item.hadSearch}
              key={item.i}
              item={item}
              title={item.i.replace(/_/g, ' ')}
              onRemove={handleRemoveComponent}
              searchValue={currentSearchText} // Pass to the TextField
              onSearch={text => setSearchQueries(prev => ({ ...prev, [item.i]: text }))} // Update state
            >
              {Component ? <Component searchText={currentSearchText} /> : null}
            </DashboardCard>
          )
        })}
      </div>
    </div>
  )
}
