import { Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import Button, { ButtonProps } from '@mui/material/Button'
import React, { ReactNode } from 'react'

import ChaarvyFlex from './chaarvyFlex'

type ColorKey = 'primary' | 'success' | 'error' | 'info' | 'secondary'

export interface ChaarvyButtonProps extends ButtonProps {
  color?: ColorKey
  fillType?: 'solid' | 'gradient'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  label?: ReactNode
  hoverEffect?: Record<string, any>
}

const ChaarvyButton = ({
  color = 'primary',
  fillType = 'gradient',
  variant = 'contained',
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
      textTransform: 'none'
    }

    // ✅ Handle variant properly
    if (variant === 'contained') {
      base.color = theme.palette.getContrastText(main)

      if (fillType === 'solid') {
        base.backgroundColor = main
        base['&:hover'] = { backgroundColor: dark }
      } else {
        base.background = `linear-gradient(to bottom, ${light}, ${dark})`
        base['&:hover'] = {
          background: `linear-gradient(to bottom, ${main}, ${dark})`
        }
      }
    }

    if (variant === 'outlined') {
      base.borderColor = main
      base.color = main

      base['&:hover'] = {
        borderColor: dark,
        backgroundColor: `${main}10`
      }
    }

    if (variant === 'text') {
      base.color = main

      base['&:hover'] = {
        backgroundColor: `${main}10`
      }
    }

    const sxResult = typeof sx === 'function' ? sx(theme) : sx

    return {
      ...base,
      ...sxResult
    }
  }

  return (
    <Tooltip title={typeof label === 'string' ? label : ''} placement='top'>
      <Button
        {...props}
        variant={variant}
        color={color ?? 'primary'} // fallback if custom
        sx={mergedSx}
      >
        <ChaarvyFlex className={{ gap: 2 }}>
          {leftIcon && <Box>{leftIcon}</Box>}
          {(label || children) && <Box>{label ?? children}</Box>}
          {rightIcon && <Box>{rightIcon}</Box>}
        </ChaarvyFlex>
      </Button>
    </Tooltip>
  )
}

export default ChaarvyButton
