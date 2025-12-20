import { Box, Typography } from '@muiElements'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { useGetStudentsCountQuery } from 'src/store/services/dashboardServices'

const Population = () => {
  const { data: studentsCount } = useGetStudentsCountQuery()

  if (!studentsCount) {
    return (
      <Box>
        <p>loading</p>
      </Box>
    )
  }

  const state = {
    series: studentsCount,
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

  const getTotalCount = () => {
    const total = studentsCount.reduce((acc, val) => acc + val, 0)

    if (total < 1000) return total

    return `${total / 1000}K`
  }

  return (
    <Box display='flex' justifyContent='start' alignItems='center' height={235}>
      <Box>
        <Box>
          <Typography variant='h4'>{getTotalCount()}</Typography>
        </Box>
        <ReactApexcharts options={state.options} series={state.series} type={state.options.chart.type} />
      </Box>
    </Box>
  )
}

export default Population
