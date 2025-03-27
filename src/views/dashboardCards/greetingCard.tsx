import { orange, deepOrange } from '@mui/material/colors'
import { Card, Typography, Box } from '@muiElements'
import React from 'react'
import { useSettings } from 'src/@core/hooks/useSettings'
import { getDailyQuote } from 'src/utils/constants'

const GreetingCard = () => {
  const { settings } = useSettings()

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Card sx={{ p: 3, bgcolor: settings.mode === 'light' ? orange[100] : deepOrange.A200 }}>
      <Box gap={2}>
        <Typography variant='h5'>
          Hi {settings.current_username ?? 'User'}, {getGreeting()}.
        </Typography>
        <Typography>{getDailyQuote()}</Typography>
      </Box>
    </Card>
  )
}

export default GreetingCard
