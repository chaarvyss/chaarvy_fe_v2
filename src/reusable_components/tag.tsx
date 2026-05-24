import { green, red } from '@mui/material/colors'
import React from 'react'

import { Typography } from '@muiElements'

interface TagProps {
  status?: number
  onClick?: () => void
  text?: string
}

export const Tag = ({ status, onClick, text }: TagProps) => {
  const baseProps = {
    display: 'inline-block',
    padding: '0px 8px',
    borderRadius: 50,
    fontSize: '1.0rem',
    fontWeight: 500,
    textTransform: 'capitalize',
    cursor: onClick ? 'pointer' : 'default'
  }

  const bgColor = status === 0 ? red : green

  return (
    <Typography
      sx={{ cursor: 'pointer' }}
      onClick={() => onClick?.()}
      bgcolor={bgColor.A100}
      color={bgColor.A700}
      {...baseProps}
    >
      {text ?? (status === 0 ? 'Inactive' : 'Active')}
    </Typography>
  )
}

export default Tag
