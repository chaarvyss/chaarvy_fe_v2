import { Box, CardContent, Typography, Stack, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import React, { useState, useMemo } from 'react'
import Chart from 'react-apexcharts'

export interface BreakdownItem {
  total: number
  categories: Record<string, number>
  beneficiaries: Record<string, number>
}

export interface ChartSeriesData {
  label: string
  categories: string[]
  data: number[]
  total: string | number
  breakdowns?: BreakdownItem[] // NEW: Array matching the length of data[] for custom tooltips
}

interface DynamicAreaChartProps {
  title: string
  data: Record<string, ChartSeriesData>
  defaultPeriod?: string
  lineColor?: string | ((selectedPeriod: string, currentData: ChartSeriesData) => string)
  height?: string | number
  valueFormatter?: (val: number) => string
}

const AreaChart: React.FC<DynamicAreaChartProps> = ({
  title,
  data,
  defaultPeriod,
  lineColor = '#2e7d32',
  height = '100%',
  valueFormatter
}) => {
  const availablePeriods = Object.keys(data)
  const initialPeriod = defaultPeriod && data[defaultPeriod] ? defaultPeriod : availablePeriods[0]

  const [period, setPeriod] = useState<string>(initialPeriod)
  const currentData = data[period]

  const activeColor = useMemo(() => {
    if (typeof lineColor === 'function') {
      return lineColor(period, currentData)
    }

    return lineColor
  }, [lineColor, period, currentData])

  const formatValue = valueFormatter || ((val: number) => val.toLocaleString('en-IN'))

  const formatKeyToLabel = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [activeColor],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] }
    },
    xaxis: {
      categories: currentData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#757575' } }
    },
    yaxis: {
      labels: { style: { colors: '#757575' }, formatter: formatValue }
    },
    grid: {
      borderColor: '#eeeeee',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      // NEW: Custom rich tooltip utilizing the breakdown data
      custom: function ({ dataPointIndex }) {
        const breakdown = currentData.breakdowns?.[dataPointIndex]
        if (!breakdown) {
          // Fallback if no breakdown data is provided
          return `<div style="padding: 10px; font-family: inherit;">
                    <strong>${formatValue(currentData.data[dataPointIndex])}</strong>
                  </div>`
        }

        // Build the Categories Breakdown HTML
        const catHtml = Object.entries(breakdown.categories)
          .map(
            ([cat, amount]) => `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                     <span style="color: #555;">${cat}:</span> 
                                     <strong>${formatValue(amount)}</strong>
                                   </div>`
          )
          .join('')

        // Build the Beneficiaries Breakdown HTML
        const benHtml = Object.entries(breakdown.beneficiaries)
          .map(
            ([ben, amount]) => `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                     <span style="color: #555;">${ben}:</span> 
                                     <strong>${formatValue(amount)}</strong>
                                   </div>`
          )
          .join('')

        // Return standard MUI-style tooltip HTML
        return `
          <div style="padding: 12px; font-family: inherit; min-width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 4px; background: #fff;">
            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
              <span style="font-size: 12px; color: #757575; text-transform: uppercase;">Total</span><br/>
              <strong style="font-size: 16px; color: ${activeColor};">${formatValue(breakdown.total)}</strong>
            </div>
            
            ${
              catHtml
                ? `<div style="margin-bottom: 8px;">
                           <div style="font-size: 11px; font-weight: bold; color: #9e9e9e; margin-bottom: 4px;">CATEGORIES</div>
                           <div style="font-size: 13px;">${catHtml}</div>
                         </div>`
                : ''
            }

            ${
              benHtml
                ? `<div>
                           <div style="font-size: 11px; font-weight: bold; color: #9e9e9e; margin-bottom: 4px;">BENEFICIARIES</div>
                           <div style="font-size: 13px;">${benHtml}</div>
                         </div>`
                : ''
            }
          </div>
        `
      }
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
        <Chart options={chartOptions} series={chartSeries} type='area' height={height} />
      </Box>
    </CardContent>
  )
}

export default AreaChart
