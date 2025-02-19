import { green, red } from '@mui/material/colors'
import React from 'react'

import { Box, Typography } from '@muiElements'

interface TagProps {
  status?: number
  onClick?: () => void
}

export const Tag = ({ status, onClick }: TagProps) => {
  const getJsx = () => {
    switch (status) {
      case 0:
        return (
          <Typography
            onClick={() => onClick?.()}
            bgcolor={red.A100}
            color={red.A700}
            padding='0px 8px'
            borderRadius={50}
          >
            Inactive
          </Typography>
        )
      case 1:
        return (
          <Typography
            onClick={() => onClick?.()}
            bgcolor={green.A100}
            color={green.A700}
            padding='0px 8px'
            borderRadius={50}
          >
            Active
          </Typography>
        )
      default:
        return null
    }
  }

  return (
    <Box display='flex' style={{ cursor: 'pointer' }}>
      {getJsx()}
    </Box>
  )
}

export default Tag
