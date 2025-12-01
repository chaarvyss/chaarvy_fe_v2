import React, { useState, useEffect } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Paper, Typography } from '@mui/material'
import Population from 'src/views/dashboardCards/population'
import Attendence from 'src/views/dashboardCards/attendence'
import MyCalendar from 'src/views/dashboardCards/calendar'
import StationaryStock from 'src/views/dashboardCards/stationaryStock'
import StudentEnrollmentChart from 'src/views/dashboardCards/studentsByCourse'
import Payments2 from 'src/views/dashboardCards/payments2'

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
    { i: 'greetingCard', x: 0, y: 0, w: 8, h: 2, shouldHide: false },
    { i: 'Students', x: 0, y: 0, w: 3, h: 3, shouldHide: false },
    { i: 'Attendence', x: 3, y: 0, w: 3, h: 3, shouldHide: true },
    { i: 'Calender', x: 6, y: 0, w: 6, h: 4, shouldHide: true },
    { i: 'Payments', x: 0, y: 3, w: 6, h: 2, shouldHide: true },
    { i: 'Stationary_stock', x: 6, y: 6, w: 6, h: 4, shouldHide: true },
    { i: 'Student_enrollments', x: 6, y: 6, w: 6, h: 4, shouldHide: true }
  ]

  const [layout, setLayout] = useState<Array<any>>([])

  useEffect(() => {
    const customizedLayout = localStorage.getItem('dashLayout')
    if (customizedLayout) {
      setLayout(JSON.parse(customizedLayout))
    } else {
      setLayout(defaultLayout)
      localStorage.setItem('dashLayout', JSON.stringify(layout))
    }
  }, [])

  const components = {
    // greetingCard: <GreetingCard />,
    Calender: <MyCalendar />,
    Students: <Population />,
    Attendence: <Attendence />,
    Payments: <Payments2 />,
    Stationary_stock: <StationaryStock />,
    Student_enrollments: <StudentEnrollmentChart />
  }

  const handleLayoutChange = newLayout => {
    localStorage.removeItem('dashLayout')
    setLayout(newLayout)
    localStorage.setItem('dashLayout', JSON.stringify(newLayout))
  }

  return (
    <div className='container-fluid'>
      <GridLayout
        className='layout'
        layout={layout}
        cols={12}
        rowHeight={100}
        width={gridWidth}
        isDraggable={true}
        isResizable={true}
        draggableHandle='.drag-handle'
        onLayoutChange={newLayout => handleLayoutChange(newLayout)}
      >
        {layout.map(item => {
          if (item.shouldHide) return null

          return (
            <div key={item.i}>
              <Paper elevation={3} className='p-3'>
                <Typography variant='h6' className='drag-handle'>
                  {item.i.replace(/_/g, ' ')}
                </Typography>
                {components[item.i]}
              </Paper>
            </div>
          )
        })}
      </GridLayout>
    </div>
  )
}

export default Dashboard
