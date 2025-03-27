import React, { useState, useEffect } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Box, Paper, Typography } from '@mui/material'
import GreetingCard from 'src/views/dashboardCards/greetingCard'
import Population from 'src/views/dashboardCards/population'
import Attendence from 'src/views/dashboardCards/attendence'
import Payments from 'src/views/dashboardCards/payments'
import GradientBox from 'src/reusable_components/styledComponents/gradientBox'
import MyCalendar from 'src/views/dashboardCards/calendar'
import StationaryStock from 'src/views/dashboardCards/stationaryStock'

const Dashboard: React.FC = () => {
  const [gridWidth, setGridWidth] = useState(window.innerWidth * 0.95)

  useEffect(() => {
    const updateWidth = () => {
      const sidebar = document.querySelector('.MuiBox-root.css-0') as HTMLElement
      const sidebarW = sidebar ? sidebar.offsetWidth : 0
      setGridWidth(window.innerWidth - sidebarW - 60)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)

    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const [layout, setLayout] = useState([
    // { i: 'greetingCard', x: 0, y: 0, w: 8, h: 2 },
    { i: 'Students', x: 0, y: 0, w: 3, h: 3 },
    { i: 'attendence', x: 3, y: 0, w: 3, h: 3 },
    { i: 'calender', x: 6, y: 0, w: 6, h: 4 },
    { i: 'payments', x: 0, y: 3, w: 6, h: 2 },
    { i: 'stationaryStock', x: 6, y: 6, w: 6, h: 4 }
  ])

  const components = {
    // greetingCard: <GreetingCard />,
    calender: <MyCalendar />,
    Students: <Population />,
    attendence: <Attendence />,
    payments: <Payments />,
    stationaryStock: <StationaryStock />
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
        onLayoutChange={newLayout => setLayout(newLayout)}
      >
        {layout.map(item => (
          <div key={item.i}>
            <Paper elevation={3} className='p-3'>
              <Typography variant='h6' className='drag-handle'>
                {item.i.replace(/^\w/, c => c.toUpperCase())}
              </Typography>
              {components[item.i]}
            </Paper>
          </div>
        ))}
      </GridLayout>
    </div>
  )
}

export default Dashboard
