import { Box, CardContent, Typography, Stack, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import React, { useState, useMemo } from 'react'
import Chart from 'react-apexcharts'

export interface ChartSeriesData {
  label: string
  categories: string[]
  data: number[]
  total: string | number
}

interface BarChartProps {
  title: string
  data: Record<string, ChartSeriesData>
  defaultPeriod?: string

  // Renamed to barColor for semantic accuracy, but behaves exactly the same
  barColor?: string | ((selectedPeriod: string, currentData: ChartSeriesData) => string)
  height?: string | number
  valueFormatter?: (val: number) => string
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  defaultPeriod,
  barColor = '#1976d2', // Default MUI Primary Blue for bars
  height = '100%',
  valueFormatter
}) => {
  const availablePeriods = Object.keys(data)
  const initialPeriod = defaultPeriod && data[defaultPeriod] ? defaultPeriod : availablePeriods[0]

  const [period, setPeriod] = useState<string>(initialPeriod)
  const currentData = data[period]

  // --- Dynamic Color Evaluation ---
  const activeColor = useMemo(() => {
    if (typeof barColor === 'function') {
      return barColor(period, currentData)
    }

    return barColor
  }, [barColor, period, currentData])

  // --- Formatting ---
  const formatValue = valueFormatter || ((val: number) => val.toLocaleString('en-IN'))

  const formatKeyToLabel = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // --- Bar-Specific Chart Configuration ---
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [activeColor],
    plotOptions: {
      bar: {
        borderRadius: 4, // Gives a modern, slightly rounded look to the bars
        columnWidth: '45%', // Prevents bars from looking too thick on large screens
        dataLabels: {
          position: 'top' // Prepares for data labels if you ever enable them
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: currentData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#757575' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#757575' },
        formatter: formatValue
      }
    },
    grid: {
      borderColor: '#eeeeee',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }, // Usually off for Bar charts to keep it clean
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: formatValue }
    }
  }

  const chartSeries = [{ name: title, data: currentData.data }]

  const handleSelectChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value)
  }

  if (!currentData) return null

  return (
    <CardContent sx={{ p: 4, height: '100%' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography color='text.secondary' variant='caption'>
            {title} ({currentData.label})
          </Typography>
          <Typography variant='h5' fontWeight='bold' sx={{ mt: 0.5, color: '#2c3e50' }}>
            {typeof currentData.total === 'number' ? formatValue(currentData.total) : currentData.total}
          </Typography>
        </Box>

        {availablePeriods.length > 1 && (
          <FormControl size='small'>
            <Select
              value={period}
              onChange={handleSelectChange}
              sx={{ fontWeight: 600, bgcolor: 'white', borderRadius: 1 }}
            >
              {availablePeriods.map(key => (
                <MenuItem key={key} value={key}>
                  {formatKeyToLabel(key)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      <Box sx={{ mt: 2, height: 'calc(100% - 80px)' }}>
        <Chart options={chartOptions} series={chartSeries} type='bar' height={height} />
      </Box>
    </CardContent>
  )
}

export default BarChart
