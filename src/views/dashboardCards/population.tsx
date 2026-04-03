import { useMemo } from 'react'

import { Box, Typography } from '@muiElements'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { useGetStudentsCountQuery } from 'src/store/services/dashboardServices'

const Population = () => {
  const { data: studentsCount } = useGetStudentsCountQuery()

  const studentData = useMemo(() => {
    if (!studentsCount) return []

    return Object.values(studentsCount) ?? []
  }, [studentsCount])

  const totalStudntCount = useMemo(() => {
    const total = studentData?.reduce((acc, val) => acc + val, 0)

    if (total < 1000) return total

    return `${total / 1000}K`
  }, [studentData])

  if (!studentsCount) {
    return (
      <Box>
        <p>loading</p>
      </Box>
    )
  }

  const state = {
    series: studentData,
    options: {
      chart: {
        width: 320,
        height: 220,
        type: 'pie' as const,
        stackType: 'normal' as const
      },
      labels: ['Male', 'Female'],
      legend: {
        position: 'right' as const
      }
    }
  }

  return (
    <Box display='flex' justifyContent='start' alignItems='center' height={235}>
      <Box>
        <Box>
          <Typography variant='h4'>{totalStudntCount || 0}</Typography>
        </Box>
        <ReactApexcharts options={state.options} series={state.series} type={state.options.chart.type} />
      </Box>
    </Box>
  )
}

export default Population
