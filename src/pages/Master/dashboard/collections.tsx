import { Box, CardContent, Typography, Stack, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import React, { useState } from 'react'
import Chart from 'react-apexcharts'

// --- Mock Data Setup ---
// Structured by time period so we can easily swap it in state
const collectionsData = {
  day: {
    label: 'Today',
    categories: ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM'],
    data: [1200, 3500, 2800, 5100, 4200, 6800],
    total: '23,600'
  },
  week: {
    label: 'This Week',
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [15000, 18500, 14000, 22000, 28000, 31000, 25000],
    total: '1,53,500'
  },
  month: {
    label: 'This Month',
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [85000, 92000, 78000, 105000],
    total: '3,60,000'
  },
  year: {
    label: 'This Year',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [450000, 380000, 520000, 490000, 610000, 580000, 650000, 720000, 680000, 810000, 950000, 1100000],
    total: '79,40,000'
  }
}

type TimePeriod = 'day' | 'week' | 'month' | 'year'

export default function CollectionsDashboard() {
  // Set default state to 'week' as requested
  const [period, setPeriod] = useState<TimePeriod>('week')

  const currentData = collectionsData[period]

  // --- Chart Configuration ---
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area', // Area charts look excellent for financial trends
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#2e7d32'], // MUI Success Green to represent revenue
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: currentData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#757575' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#757575' },
        formatter: val => {
          // Formats numbers into the Indian Numbering System (e.g., 1,50,000)
          return `₹${val.toLocaleString('en-IN')}`
        }
      }
    },
    grid: {
      borderColor: '#eeeeee',
      strokeDashArray: 4, // Dotted grid lines for a cleaner look
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: val => `₹${val.toLocaleString('en-IN')}`
      }
    }
  }

  const chartSeries = [
    {
      name: 'Collections',
      data: currentData.data
    }
  ]

  const handleSelectChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value as TimePeriod)
  }

  return (
    <CardContent sx={{ p: 4 }}>
      {/* Header & Controls Row */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
        sx={{ mb: 4 }}
      >
        {/* Total Metric Area */}
        <Box>
          <Typography color='text.secondary' variant='caption'>
            Total Collections ({currentData.label})
          </Typography>
          <Typography variant='h5' fontWeight='bold' sx={{ mt: 0.5, color: '#2c3e50' }}>
            ₹{currentData.total}
          </Typography>
        </Box>

        <FormControl size='small'>
          <Select
            value={period}
            onChange={handleSelectChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Time Period' }}
            sx={{
              fontWeight: 600,
              bgcolor: 'white',
              borderRadius: 1
            }}
          >
            <MenuItem value='day'>Day</MenuItem>
            <MenuItem value='week'>Week</MenuItem>
            <MenuItem value='month'>Month</MenuItem>
            <MenuItem value='year'>Year</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Chart Area */}
      <Box sx={{ mt: 2 }}>
        <Chart options={chartOptions} series={chartSeries} type='area' height='100%' />
      </Box>
    </CardContent>
  )
}
