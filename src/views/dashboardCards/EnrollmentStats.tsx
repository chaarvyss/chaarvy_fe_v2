import { Box, Card, CardContent, Typography, Grid, Stack, Chip } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import Chart from 'react-apexcharts'

export default function EnrollmentDashboardApex() {
  const chartSeries = [
    {
      name: 'Active (Male)',
      group: 'active',
      data: [620, 650]
    },
    {
      name: 'Active (Female)',
      group: 'active',
      data: [580, 600]
    },
    {
      name: 'Dropout (Male)',
      group: 'dropout',
      data: [18, 20]
    },
    {
      name: 'Dropout (Female)',
      group: 'dropout',
      data: [12, 14]
    }
  ]

  // 2. Configure the ApexCharts options
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: true,
        tools: { download: true, selection: false, zoom: false, pan: false }
      },
      fontFamily: 'inherit' // Inherits your MUI theme font
    },
    colors: ['#1976d2', '#9c27b0', '#ef5350', '#d32f2f'], // Blue, Purple, Light Red, Dark Red
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 2 // Softens the edges slightly
      }
    },
    dataLabels: {
      enabled: false // Turns off the numbers inside the bars to prevent clutter
    },
    stroke: {
      width: 1,
      colors: ['#fff'] // Adds a tiny white line between the stacked segments
    },
    xaxis: {
      categories: ['2025 (Previous Year)', '2026 (Current Year)'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: {
        text: 'Number of Students',
        style: { fontWeight: 500 }
      }
    },
    tooltip: {
      y: {
        formatter: val => `${val} Students`
      },
      theme: 'light'
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: 'bottom',
      markers: { radius: 12 } // Makes legend markers circular
    }
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Typography variant='h5' fontWeight='bold' color='text.primary' sx={{ mb: 3 }}>
        Student Enrollment & Retention
      </Typography>

      {/* KPI Cards (Same as previous MUI layout) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Active Students Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography color='text.secondary' variant='subtitle2' fontWeight='500'>
                    Total Active Students
                  </Typography>
                  <Typography variant='h3' fontWeight='bold' sx={{ mt: 1, mb: 1.5, color: '#2c3e50' }}>
                    1,250
                  </Typography>
                  <Chip
                    label='▲ +4.2% vs Last Year'
                    color='success'
                    size='small'
                    variant='outlined'
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Box textAlign='right'>
                  <Typography variant='body2' sx={{ color: '#1976d2', fontWeight: 'bold', mb: 0.5 }}>
                    Male: 650
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                    Female: 600
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Dropout Students Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography color='text.secondary' variant='subtitle2' fontWeight='500'>
                    Total Dropouts
                  </Typography>
                  <Typography variant='h3' fontWeight='bold' sx={{ mt: 1, mb: 1.5, color: '#2c3e50' }}>
                    34
                  </Typography>
                  <Chip
                    label='▲ +13.3% vs Last Year'
                    color='error'
                    size='small'
                    variant='outlined'
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Box textAlign='right'>
                  <Typography variant='body2' sx={{ color: '#ef5350', fontWeight: 'bold', mb: 0.5 }}>
                    Male: 20
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    Female: 14
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ApexCharts Section */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <CardContent>
          <Typography variant='h6' fontWeight='600' color='text.primary' sx={{ mb: 1 }}>
            Year-over-Year Comparison
          </Typography>

          <Box sx={{ width: '100%', mt: 2 }}>
            <Chart options={chartOptions} series={chartSeries} type='bar' height={400} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
