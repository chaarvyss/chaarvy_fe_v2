import { green, red } from '@mui/material/colors'
import { Box, Typography } from '@muiElements'
import React from 'react'

interface TagProps {
  status?: number
  onClick?: () => void
}

export const Tag = ({ status, onClick }: TagProps) => {
  const getJsx = () => {
    switch (status) {
      case 0:
        return (
          <Typography bgcolor={red.A100} color={red.A700} padding='0px 8px' borderRadius={50}>
            Inactive
          </Typography>
        )
      case 1:
        return (
          <Typography bgcolor={green.A100} color={green.A700} padding='0px 8px' borderRadius={50}>
            Active
          </Typography>
        )
      default:
        return null
    }
  }
  return (
    <Box display='flex' style={{ cursor: 'pointer' }} onClick={() => onClick?.()}>
      {getJsx()}
    </Box>
  )
}

export default Tag
