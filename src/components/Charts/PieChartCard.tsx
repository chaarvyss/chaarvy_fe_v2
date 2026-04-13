import { useMemo } from 'react'

import { Box, Typography } from '@muiElements'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

interface PieChartCardProps {
  isLoading?: boolean
  values: number[]
  labels: string[]
}

const PieChartCard = ({ isLoading, values = [], labels }: PieChartCardProps) => {
  const total = useMemo(() => {
    const total = values?.reduce((acc, val) => acc + val, 0)

    if (total < 1000) return total

    return `${total / 1000}K`
  }, [values])

  if (isLoading) {
    return (
      <Box>
        <p>loading</p>
      </Box>
    )
  }

  const state = {
    series: values ?? [],
    options: {
      chart: {
        width: 320,
        height: 220,
        type: 'pie' as const,
        stackType: 'normal' as const
      },
      labels: labels ?? [],
      legend: {
        position: 'right' as const
      }
    }
  }

  return (
    <Box display='flex' justifyContent='start' alignItems='center' height={235}>
      <Box>
        <Box>
          <Typography variant='h3'>{total || 0}</Typography>
        </Box>
        <ReactApexcharts options={state.options} series={state.series} type={state.options.chart.type} />
      </Box>
    </Box>
  )
}

export default PieChartCard
