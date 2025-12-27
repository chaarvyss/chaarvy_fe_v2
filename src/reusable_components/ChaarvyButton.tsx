import { Tooltip } from '@mui/material'
import Box from '@mui/material/Box'
import Button, { ButtonProps } from '@mui/material/Button'
import React, { ReactNode } from 'react'

type ColorKey = 'primary' | 'success' | 'error' | 'info' | 'secondary' | 'warning'

export interface ChaarvyButtonProps extends Omit<ButtonProps, 'color'> {
  color?: ColorKey
  fillType?: 'solid' | 'gradient' // 'solid' -> single color fill, 'gradient' -> top-to-bottom gradient
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  label?: ReactNode
  hoverEffect?: Record<string, any>
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
  // Use sx to compute dynamic backgrounds from theme palette
  const mergedSx = (theme: any) => {
    const palette = theme.palette[color] || theme.palette.primary

    const solidBg = palette.main
    const light = palette.light ?? palette.main
    const dark = palette.dark ?? palette.main

    const textColor = theme.palette.getContrastText(solidBg)

    const base: any = {
      color: textColor,
      textTransform: 'none'
    }

    if (fillType === 'solid') {
      base.background = solidBg
      base['&:hover'] = {
        background: palette.dark ?? solidBg
      }
    } else {
      // gradient
      base.background = `linear-gradient(to bottom, ${light}, ${dark})`
      base['&:hover'] = {
        background: `linear-gradient(to bottom, ${palette.main}, ${dark})`
      }
    }

    if (typeof sx === 'function') {
      return { ...sx(theme), ...base }
    }

    return { ...base, ...(sx || {}) }
  }

  const styles = mergedSx

  return (
    <Tooltip title={typeof label === 'string' ? label : ''} placement='top'>
      <Button {...props} color='inherit' sx={styles}>
        <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {leftIcon && (
            <Box component='span' sx={{ display: 'inline-flex' }}>
              {leftIcon}
            </Box>
          )}
          <Box
            color={theme => {
              const palette = theme.palette[color] || theme.palette.primary
              const solidBg = palette.main
              return theme.palette.getContrastText(solidBg)
            }}
            component='span'
          >
            {label ?? children}
          </Box>
          {rightIcon && (
            <Box component='span' sx={{ display: 'inline-flex' }}>
              {rightIcon}
            </Box>
          )}
        </Box>
      </Button>
    </Tooltip>
  )
}

export default ChaarvyButton
