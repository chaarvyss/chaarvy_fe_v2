import React from 'react'

import { Box, Card, Typography } from '@muiElements'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

const Attendence = () => {
  const [state, setState] = React.useState({
    series: [
      {
        name: 'Attended',
        data: [1500, 3500]
      },
      {
        name: 'Absent',
        data: [200, 300]
      }
    ],
    options: {
      chart: {
        type: 'bar' as const,
        height: 220,
        stacked: true,
        stackType: 'normal' as const
      },
      plotOptions: {
        bar: {
          horizontal: false // ✅ Horizontal bar for better readability
        }
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },

      fill: {
        opacity: 1
      },
      legend: {
        position: 'bottom' as const,
        horizontalAlign: 'right' as const
      },
      xaxis: {
        categories: ['Male', 'Female'] // ✅ Define labels for the y-axis
      }
    }
  })

  return (
    <Box display='flex' justifyContent='start' alignItems='center'>
      <Box>
        <ReactApexcharts
          options={state.options}
          series={state.series}
          type={state.options.chart.type}
          height={state.options.chart.height}
        />
      </Box>
    </Box>
  )
}

export default Attendence
