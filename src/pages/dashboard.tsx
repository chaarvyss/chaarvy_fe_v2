import { Paper, Typography, Box } from '@mui/material'
import type { GridStack } from 'gridstack'
import React, { useState, useEffect, useCallback, useRef } from 'react'

// 1. Import GridStack core and its CSS
import 'gridstack/dist/gridstack.min.css'

import { PermissionLabels } from 'src/constants/permissions'
import { isAuthorised } from 'src/lib/util/permissionCheck'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import GetChaarvyIcons from 'src/utils/icons'
import Attendence from 'src/views/dashboardCards/attendence'
import MyCalendar from 'src/views/dashboardCards/calendar'
import Payments2 from 'src/views/dashboardCards/payments2'
import Population from 'src/views/dashboardCards/population'
import StationaryStock from 'src/views/dashboardCards/stationaryStock'
import StudentEnrollmentChart from 'src/views/dashboardCards/studentsByCourse'

type DashboardCardProps = {
  item: any
  title: string
  onRemove: (id: string) => void
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

// 2. Refactor Card to match GridStack's strict DOM requirements
const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ item, title, onRemove, children, ...rest }, ref) => {
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
              <ChaarvyButton
                size='small'
                variant='contained'
                color='error'
                onClick={() => onRemove(item.i)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 32,
                  padding: '4px 8px',
                  zIndex: 10
                }}
                startIcon={<GetChaarvyIcons iconName='Close' />}
              />
            )}
            <Typography variant='h6' className='drag-handle' style={{ cursor: 'grab', marginBottom: '8px' }}>
              {title}
            </Typography>
            <div style={{ flexGrow: 1, overflow: 'auto' }}>{children}</div>
          </Paper>
        </div>
      </div>
    )
  }
)

interface LayoutCards {
  i: string
  x: number
  y: number
  w: number
  h: number
  shouldHide: boolean
  permission_key: string
}

const Dashboard: React.FC = () => {
  const permissionPrefix = PermissionLabels.dashboard
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<GridStack | null>(null)

  const defaultLayout: LayoutCards[] = [
    { i: 'greetingCard', x: 0, y: 0, w: 8, h: 2, shouldHide: true, permission_key: '' },
    { i: 'Students', x: 0, y: 0, w: 4, h: 3, shouldHide: false, permission_key: permissionPrefix.studentCount },
    { i: 'Attendence', x: 4, y: 0, w: 4, h: 3, shouldHide: true, permission_key: '' },
    { i: 'Calender', x: 8, y: 0, w: 4, h: 4, shouldHide: true, permission_key: '' },
    { i: 'Payments', x: 0, y: 3, w: 6, h: 2, shouldHide: false, permission_key: permissionPrefix.payments },
    {
      i: 'Stationary_stock',
      x: 6,
      y: 3,
      w: 6,
      h: 3,
      shouldHide: false,
      permission_key: permissionPrefix.stationaryStock
    },
    {
      i: 'Student_enrollments',
      x: 0,
      y: 6,
      w: 12,
      h: 4,
      shouldHide: false,
      permission_key: permissionPrefix.studentEnrollments
    }
  ]

  const [layout, setLayout] = useState<LayoutCards[]>([])
  const [isGridReady, setIsGridReady] = useState(false)

  // Initialization & LocalStorage merge
  useEffect(() => {
    const customizedLayout = localStorage.getItem('dashLayout')
    if (customizedLayout) {
      const parsedSavedLayout = JSON.parse(customizedLayout)
      const mergedLayout = defaultLayout.map(defItem => {
        const savedItem = parsedSavedLayout.find((s: LayoutCards) => s.i === defItem.i)

        return savedItem ? { ...defItem, ...savedItem } : defItem
      })
      setLayout(mergedLayout)
    } else {
      setLayout(defaultLayout)
      localStorage.setItem('dashLayout', JSON.stringify(defaultLayout))
    }
    setIsGridReady(true)
  }, [])

  // 3. GridStack Initialization and Event Syncing
  useEffect(() => {
    if (!isGridReady || !containerRef.current) return

    // Safely capture the DOM element so TypeScript knows it is definitely not null
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
        ) // <-- Pass the safe variable here instead of containerRef.current

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
            localStorage.setItem('dashLayout', JSON.stringify(updatedLayout))

            return updatedLayout
          })
        })
      } else {
        // Use the safe variable here as well
        const uninitializedWidgets = gridEl.querySelectorAll('.grid-stack-item:not(.ui-draggable)')
        uninitializedWidgets.forEach(el => {
          gridRef.current?.makeWidget(el as HTMLElement) // <--- Add 'as HTMLElement'
        })
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [layout, isGridReady])

  const components: { [key: string]: React.ElementType } = {
    Calender: MyCalendar,
    Students: Population,
    Attendence: Attendence,
    Payments: Payments2,
    Stationary_stock: StationaryStock,
    Student_enrollments: StudentEnrollmentChart
  }

  // Remove (Hide) Component
  const handleRemoveComponent = useCallback((id: string) => {
    // Manually tell GridStack to release the element before React unmounts it
    const el = document.querySelector(`[gs-id="${id}"]`)
    if (el && gridRef.current) gridRef.current.removeWidget(el as HTMLElement, false) // <--- Add 'as HTMLElement'

    setLayout(prevLayout => {
      const nextLayout = prevLayout.map(item => (item.i === id ? { ...item, shouldHide: true } : item))
      localStorage.setItem('dashLayout', JSON.stringify(nextLayout))

      return nextLayout
    })
  }, [])

  // Restore Component
  const handleRestoreComponent = useCallback((id: string) => {
    setLayout(prevLayout => {
      const nextLayout = prevLayout.map(item => (item.i === id ? { ...item, shouldHide: false } : item))
      localStorage.setItem('dashLayout', JSON.stringify(nextLayout))

      return nextLayout
    })
  }, [])

  // Reset Component
  const handleResetDashboard = () => {
    if (gridRef.current) {
      gridRef.current.destroy(false)
      gridRef.current = null
    }
    setLayout(defaultLayout)
    localStorage.setItem('dashLayout', JSON.stringify(defaultLayout))
  }

  const availableHiddenWidgets = layout.filter(
    item => item.shouldHide && isAuthorised(item.permission_key) && item.i !== 'greetingCard'
  )

  return (
    <div className='container-fluid' style={{ position: 'relative' }}>
      {/* Dashboard Toolbar */}
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
          <GetChaarvyIcons iconName='Undo' /> Reset Layout
        </ChaarvyButton>
      </Box>

      {/* GridStack Container */}
      <div className='grid-stack' ref={containerRef}>
        {layout.map(item => {
          if (item.shouldHide || !isAuthorised(item.permission_key)) return null

          const Component = components[item.i]

          return (
            <DashboardCard key={item.i} item={item} title={item.i.replace(/_/g, ' ')} onRemove={handleRemoveComponent}>
              {Component ? <Component /> : null}
            </DashboardCard>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
