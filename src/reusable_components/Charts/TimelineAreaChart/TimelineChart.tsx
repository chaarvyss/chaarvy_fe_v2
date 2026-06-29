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
import { ApexOptions } from 'apexcharts'
import { useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import DatePicker from 'react-datepicker'

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import CustomDateElement from 'src/reusable_components/dateInputElement'
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

export interface TimelineChartData<T> {
  categories: string[]
  series: ChartSeries[]
  summary: SummaryMetric[]
  bucketedRecords: T[][]
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
  startDate: string
  endDate: string
  frequency: TimeFrequency
  onFrequencyChange: (freq: TimeFrequency) => void
  onDateChange: (start: string, end: string) => void
  onNext: () => void
  onPrevious: () => void
  valueFormatter?: (val: number) => string
  tooltipFormatter?: (params: TooltipParams<T>) => string
}

const DynamicTimelineChart = <T,>({
  data,
  startDate,
  endDate,
  frequency,
  onFrequencyChange,
  onDateChange,
  onNext,
  onPrevious,
  valueFormatter,
  tooltipFormatter
}: DynamicTimelineChartProps<T>) => {
  const formatValue = valueFormatter || ((val: number) => val.toLocaleString('en-IN'))

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  ])

  // --- NEW: Sync local state if Next/Prev buttons are clicked from the parent ---
  useEffect(() => {
    setDateRange([startDate ? new Date(startDate) : null, endDate ? new Date(endDate) : null])
  }, [startDate, endDate])

  // --- NEW: Safe local date formatter (prevents timezone bugs from toISOString) ---
  const formatLocal = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

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
        const category = data?.categories[dataPointIndex] || ''
        const seriesData = w.globals.seriesNames.map((name: string, index: number) => ({
          seriesName: name,
          value: w.globals.series[index][dataPointIndex],
          color: w.globals.colors[index]
        }))
        const records = data?.bucketedRecords[dataPointIndex] || []

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
          {/* NEW DATE RANGE SELECTOR UI */}

          <Stack direction='row' alignItems='center' spacing={1}>
            <IconButton size='small' onClick={onPrevious}>
              <GetChaarvyIcons iconName='ChevronLeft' />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(dates: [Date | null, Date | null]) => {
                  // 2. Update local state instantly so the UI highlights the first click
                  setDateRange(dates)

                  const [start, end] = dates

                  // 3. Only notify the parent (and trigger API) when BOTH are selected
                  if (start && end) {
                    onDateChange(formatLocal(start), formatLocal(end))
                  }
                }}
                customInput={<CustomDateElement label='' />}
                dateFormat='dd MMM yyyy'
                showMonthDropdown
                showYearDropdown
                portalId='root-portal'
                dropdownMode='select'
                popperContainer={({ children }) => <DatePickerWrapper>{children}</DatePickerWrapper>}
              />
            </Box>

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
              <MenuItem value='week'>Weekly Step</MenuItem>
              <MenuItem value='month'>Monthly Step</MenuItem>
              <MenuItem value='year'>Yearly Step</MenuItem>
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
