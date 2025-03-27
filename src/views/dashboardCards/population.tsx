import { Box, Card, Typography } from '@muiElements'
import React from 'react'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

const Population = () => {
  const [state, setState] = React.useState({
    series: [1700, 3800],
    options: {
      chart: {
        width: 320,
        height: 220,
        type: 'pie' as const
      },
      labels: ['Male', 'Female'],
      legend: {
        position: 'right' as const
      }
      // responsive: [
      //   {
      //     breakpoint: 480,
      //     options: {
      //       chart: {
      //         width: 200
      //       },
      //       legend: {
      //         position: 'bottom'
      //       }
      //     }
      //   }
      // ]
    }
  })

  return (
    <Box display='flex' justifyContent='start' alignItems='center' height={235}>
      <Box>
        <Box>
          <Typography variant='h4'>5.5K</Typography>
        </Box>
        <ReactApexcharts options={state.options} series={state.series} type={state.options.chart.type} />
      </Box>
    </Box>
  )
}

export default Population
