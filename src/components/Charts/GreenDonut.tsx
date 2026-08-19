import { Box, CircularProgress, Typography } from '@mui/material' // Adjust your imports
import React from 'react'

interface GreenDonutProps {
  value: number // Percentage (0-100)
  size?: number // Diameter in pixels
}

const GreenDonut: React.FC<GreenDonutProps> = ({ value, size = 40 }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {/* 1. Light Grey Background Track */}
      <CircularProgress variant='determinate' value={100} size={size} thickness={4.5} sx={{ color: 'grey.200' }} />

      {/* 2. Green Foreground Progress */}
      <CircularProgress
        variant='determinate'
        value={value}
        size={size}
        thickness={4.5}
        sx={{
          color: 'success.main', // Uses your theme's green
          position: 'absolute',
          left: 0,

          // Adds a rounded cap to the end of the green stroke
          [`& .MuiCircularProgress-circle`]: { strokeLinecap: 'round' }
        }}
      />

      {/* 3. Centered Percentage Text */}
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant='caption'
          color='text.secondary'
          fontWeight={600}
          sx={{ fontSize: size * 0.28 }} // Scales text based on the donut size
        >
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  )
}

export default GreenDonut
