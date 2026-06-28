import React from 'react'
import {
  Box,
  CardContent,
  Typography,
  Stack,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton
} from '@mui/material'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import GetChaarvyIcons from 'src/utils/icons'

export type TimeFrequency = 'week' | 'month' | 'year'

export interface ChartSeries {
  name: string
  data: number[]
  color: string
}

export interface SummaryMetric {
  label: string
  value: number
  color: string
}

// <T> makes this interface aware of your specific data records
export interface TimelineChartData<T> {
  dateRangeLabel: string
  categories: string[]
  series: ChartSeries[]
  summary: SummaryMetric[]
  bucketedRecords: T[][] // NEW: Stores raw records for each time bucket
}

export interface TooltipParams<T> {
  category: string
  seriesData: {
    seriesName: string
    value: number
    color: string
  }[]
  records: T[]
}

interface DynamicTimelineChartProps<T> {
  data: TimelineChartData<T> | null
  frequency: TimeFrequency
  onFrequencyChange: (freq: TimeFrequency) => void
  onNext: () => void
  onPrevious: () => void
  valueFormatter?: (val: number) => string
  tooltipFormatter?: (params: TooltipParams<T>) => string // NEW: Custom Tooltip renderer
}

const DynamicTimelineChart = <T,>({
  data,
  frequency,
  onFrequencyChange,
  onNext,
  onPrevious,
  valueFormatter,
  tooltipFormatter
}: DynamicTimelineChartProps<T>) => {
  const formatValue = valueFormatter || ((val: number) => val.toLocaleString('en-IN'))

  const handleSelectChange = (event: SelectChangeEvent) => {
    onFrequencyChange(event.target.value as TimeFrequency)
  }

  const chartOptions: ApexOptions = {
    chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false } },
    colors: data?.series.map(s => s.color) || ['#f55252'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    xaxis: {
      categories: data?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#757575' } }
    },
    yaxis: { labels: { style: { colors: '#757575' }, formatter: formatValue } },
    grid: {
      borderColor: '#eeeeee',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ dataPointIndex, w }) {
        // 1. Get the category label for this data point
        const category = data?.categories[dataPointIndex] || ''

        // 2. Gather data from ALL series for this specific index
        const seriesData = w.globals.seriesNames.map((name: string, index: number) => ({
          seriesName: name,
          value: w.globals.series[index][dataPointIndex],
          color: w.globals.colors[index]
        }))

        // 3. Get the raw records for this time bucket
        const records = data?.bucketedRecords[dataPointIndex] || []

        // 4. Pass the correct structure to your formatter
        if (tooltipFormatter) {
          return tooltipFormatter({ category, seriesData, records })
        }

        return `<div style="padding: 10px;">${formatValue(w.globals.series[0][dataPointIndex])}</div>`
      }
    }
  }

  return (
    <CardContent sx={{ p: 4, height: '100%' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
        sx={{ mb: 2 }}
      >
        <Box>
          {data && (
            <Stack direction='row' spacing={3} sx={{ mt: 1 }}>
              {data.summary.map((metric, idx) => (
                <Box key={idx}>
                  <Typography variant='caption' color='text.secondary'>
                    Total {metric.label}
                  </Typography>
                  <Typography variant='subtitle1' fontWeight='bold' sx={{ color: metric.color }}>
                    {formatValue(metric.value)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        <Stack direction='row' alignItems='center' spacing={2}>
          <Stack
            direction='row'
            alignItems='center'
            spacing={1}
            sx={{ bgcolor: '#f5f5f5', borderRadius: 2, px: 1, py: 0.5 }}
          >
            <IconButton size='small' onClick={onPrevious}>
              <GetChaarvyIcons iconName='ChevronLeft' />
            </IconButton>
            <Typography variant='body2' fontWeight='600' sx={{ minWidth: 140, textAlign: 'center' }}>
              {data?.dateRangeLabel || 'Loading...'}
            </Typography>
            <IconButton size='small' onClick={onNext}>
              <GetChaarvyIcons iconName='ChevronRight' />
            </IconButton>
          </Stack>

          <FormControl size='small'>
            <Select
              value={frequency}
              onChange={handleSelectChange}
              sx={{ fontWeight: 600, bgcolor: 'white', borderRadius: 1 }}
            >
              <MenuItem value='week'>Weekly</MenuItem>
              <MenuItem value='month'>Monthly</MenuItem>
              <MenuItem value='year'>Yearly</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Box>
        {data ? (
          <Chart options={chartOptions} series={data.series} type='area' height='100%' />
        ) : (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <Typography color='text.secondary'>No data available for this period.</Typography>
          </Box>
        )}
      </Box>
    </CardContent>
  )
}

export default DynamicTimelineChart
