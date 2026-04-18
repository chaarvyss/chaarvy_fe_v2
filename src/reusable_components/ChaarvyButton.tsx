import { Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import Button, { ButtonProps } from '@mui/material/Button'
import React, { ReactNode } from 'react'

type ColorKey = 'primary' | 'success' | 'error' | 'info' | 'secondary' | 'lightblue'

export interface ChaarvyButtonProps extends Omit<ButtonProps, 'color'> {
  color?: ColorKey
  fillType?: 'solid' | 'gradient'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  label?: ReactNode
  hoverEffect?: Record<string, any>
  variant?: 'text' | 'outlined' | 'contained'
}

const ChaarvyButton = ({
  color = 'primary',
  fillType = 'gradient',
  sx,
  leftIcon,
  rightIcon,
  label,
  children,
  ...props
}: ChaarvyButtonProps) => {
  const mergedSx = (theme: any) => {
    const palette = theme.palette[color] || theme.palette.primary

    const main = palette.main
    const light = palette.light ?? main
    const dark = palette.dark ?? main

    const base: any = {
      color: theme.palette.getContrastText(main),
      textTransform: 'none'
    }

    if (fillType === 'solid') {
      base.backgroundColor = main
      base['&:hover'] = {
        backgroundColor: dark
      }
    } else {
      base.background = `linear-gradient(to bottom, ${light}, ${dark})`
      base['&:hover'] = {
        background: `linear-gradient(to bottom, ${main}, ${dark})`
      }
    }

    return typeof sx === 'function'
      ? { ...base, ...sx(theme) } // ensure your base is not overridden unintentionally
      : { ...base, ...(sx || {}) }
  }

  return (
    <Tooltip title={typeof label === 'string' ? label : ''} placement='top'>
      <Button {...props} color='inherit' sx={mergedSx}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {leftIcon && <Box>{leftIcon}</Box>}
          {(label || children) && <Box>{label ?? children}</Box>}
          {rightIcon && <Box>{rightIcon}</Box>}
        </Box>
      </Button>
    </Tooltip>
  )
}

export default ChaarvyButton
