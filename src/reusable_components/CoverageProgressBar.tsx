import { Box, Tooltip, Typography } from '@mui/material'
import React from 'react'

interface CoverageProgressBarProps {
  completed: number
  pending: number
  overdue: number
  total: number
}

const CoverageProgressBar = ({ completed, pending, overdue, total }: CoverageProgressBarProps) => {
  const progress = total === 0 ? 0 : (completed / total) * 100

  const tooltipContent = (
    <Box p={0.5}>
      <Typography variant='body2' fontWeight={600}>
        Total Topics: {total}
      </Typography>
      <Box mt={1}>
        <Typography variant='caption' display='block' sx={{ color: '#81c784' }}>
          Completed: {completed}
        </Typography>
        <Typography variant='caption' display='block' sx={{ color: '#ffb74d' }}>
          Pending: {pending}
        </Typography>
        <Typography variant='caption' display='block' sx={{ color: '#e57373' }}>
          Overdue: {overdue}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Tooltip title={tooltipContent} arrow placement='top'>
      <Box sx={{ width: '100%', cursor: 'pointer', mb: 3 }}>
        <Box display='flex' justifyContent='space-between' alignItems='flex-end' mb={1}>
          <Typography variant='subtitle1' fontWeight={700} color='text.primary'>
            Coverage Progress
          </Typography>
          <Typography variant='body2' fontWeight={600} color='text.secondary'>
            {Math.round(progress)}% ({completed}/{total})
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            height: 10,
            borderRadius: 5,
            display: 'flex',
            overflow: 'hidden',
            bgcolor: 'rgba(0,0,0,0.05)'
          }}
        >
          {total > 0 && (
            <>
              <Box sx={{ width: `${(completed / total) * 100}%`, bgcolor: '#4caf50', transition: 'width 0.3s' }} />
              <Box sx={{ width: `${(overdue / total) * 100}%`, bgcolor: '#f44336', transition: 'width 0.3s' }} />
              <Box sx={{ width: `${(pending / total) * 100}%`, bgcolor: '#ff9800', transition: 'width 0.3s' }} />
            </>
          )}
        </Box>
      </Box>
    </Tooltip>
  )
}

export default CoverageProgressBar
