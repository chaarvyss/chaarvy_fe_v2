import { Paper, Typography } from '@mui/material'
import React, { useState, useEffect, useCallback } from 'react'
import GridLayout from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'
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

const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ item, title, onRemove, children, ...rest }, ref) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <div ref={ref} {...rest} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Paper elevation={3} className='p-3' style={{ position: 'relative' }}>
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
              startIcon={<GetChaarvyIcons iconName={ChaarvyIcon.Close} />}
            />
          )}
          <Typography variant='h6' className='drag-handle'>
            {title}
          </Typography>
          {children}
        </Paper>
      </div>
    )
  }
)

const Dashboard: React.FC = () => {
  const [gridWidth, setGridWidth] = useState(window.innerWidth * 0.95)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateWidth = () => {
      const sidebar = document.querySelector('.MuiBox-root.css-0') as HTMLElement
      const sidebarW = sidebar ? sidebar.offsetWidth : 0
      setGridWidth(window.innerWidth - sidebarW - 60)
    }

    // Run on mount
    updateWidth()

    // Debounced resize event
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateWidth, 150) // Adjust debounce time if needed
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const defaultLayout = [
    { i: 'greetingCard', x: 0, y: 0, w: 8, h: 2, shouldHide: true },
    { i: 'Students', x: 0, y: 0, w: 4, h: 3, shouldHide: false },
    { i: 'Attendence', x: 4, y: 0, w: 4, h: 3, shouldHide: true },
    { i: 'Calender', x: 8, y: 0, w: 4, h: 4, shouldHide: true },
    { i: 'Payments', x: 0, y: 3, w: 6, h: 2, shouldHide: false },
    { i: 'Stationary_stock', x: 6, y: 3, w: 6, h: 3, shouldHide: false },
    { i: 'Student_enrollments', x: 0, y: 5, w: 12, h: 4, shouldHide: false }
  ]

  const [layout, setLayout] = useState<Array<any>>([])

  useEffect(() => {
    const customizedLayout = localStorage.getItem('dashLayout')
    if (customizedLayout) {
      setLayout(JSON.parse(customizedLayout))
    } else {
      setLayout(defaultLayout)
      localStorage.setItem('dashLayout', JSON.stringify(defaultLayout))
    }
  }, [])

  const components = {
    Calender: MyCalendar,
    Students: Population,
    Attendence: Attendence,
    Payments: Payments2,
    Stationary_stock: StationaryStock,
    Student_enrollments: StudentEnrollmentChart
  }

  const handleLayoutChange = useCallback(newLayout => {
    setLayout(newLayout)
    localStorage.setItem('dashLayout', JSON.stringify(newLayout))
  }, [])

  const handleRemoveComponent = useCallback(
    id => {
      const nextLayout = layout.filter(item => item.i !== id)
      setLayout(nextLayout)
      localStorage.setItem('dashLayout', JSON.stringify(nextLayout))
    },
    [layout]
  )

  const handleResetDashboard = () => {
    setLayout(defaultLayout)
    localStorage.setItem('dashLayout', JSON.stringify(defaultLayout))
  }

  return (
    <div className='container-fluid' style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <ChaarvyButton size='small' variant='outlined' color='primary' onClick={handleResetDashboard}>
          <GetChaarvyIcons iconName={ChaarvyIcon.Undo} />
        </ChaarvyButton>
      </div>
      <GridLayout
        className='layout'
        layout={layout}
        cols={12}
        rowHeight={100}
        width={gridWidth}
        isDraggable={true}
        isResizable={true}
        compactType={null}
        preventCollision={true}
        draggableHandle='.drag-handle'
        onLayoutChange={newLayout => handleLayoutChange(newLayout)}
      >
        {layout.map(item => {
          if (item.shouldHide) return null

          const Component = components[item.i]

          return (
            <DashboardCard key={item.i} item={item} title={item.i.replace(/_/g, ' ')} onRemove={handleRemoveComponent}>
              {Component ? <Component /> : null}
            </DashboardCard>
          )
        })}
      </GridLayout>
    </div>
  )
}

export default Dashboard
