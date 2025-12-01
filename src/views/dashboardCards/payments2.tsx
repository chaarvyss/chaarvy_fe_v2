import { Box } from '@mui/material'
import { useEffect } from 'react'

import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { useGetPaymentsCountQuery } from 'src/store/services/dashboardServices'

const Payments2 = () => {
  const { data: counts } = useGetPaymentsCountQuery()

  useEffect(() => {}, [counts])

  if (counts) {
    // Clone counts to avoid modifying an immutable object
    const countsClone = JSON.parse(JSON.stringify(counts))

    const state = {
      series: countsClone.series,
      options: {
        chart: {
          type: 'bar' as const,
          height: 220,
          stacked: true,
          stackType: 'normal' as const
        },
        plotOptions: {
          bar: {
            horizontal: true
          }
        },
        stroke: {
          colors: ['#fff']
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: 'bottom' as const,
          horizontalAlign: 'right' as const
        },
        xaxis: countsClone.xaxis
      }
    }

    return (
      <Box display='flex' justifyContent='start' alignItems='center'>
        <Box width='100%'>
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

  return <p>Loading</p>
}

export default Payments2
