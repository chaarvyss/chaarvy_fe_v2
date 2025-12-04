import React, { useEffect, useState } from 'react'

import { Box, Typography } from '@muiElements'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { useGetStudentsCountQuery } from 'src/store/services/dashboardServices'

const Population = () => {
  const { data: studentsCount } = useGetStudentsCountQuery()

  useEffect(() => {}, [studentsCount])
  if (studentsCount) {
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
      const total = ([] as number[]).concat(studentsCount ?? []).reduce((acc, val) => acc + val, 0)
      if (total < 1000) {
        return total
      }

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

  return (
    <Box>
      <p>loading</p>
    </Box>
  )
}

export default Population
