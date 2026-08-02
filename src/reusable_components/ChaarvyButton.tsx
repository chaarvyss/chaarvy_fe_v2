import { Tooltip, CircularProgress } from '@mui/material'
import Box from '@mui/material/Box'
import Button, { ButtonProps } from '@mui/material/Button'
import React, { ReactNode } from 'react'

import GetChaarvyIcons, { GetChaarvyIconsProps } from 'src/utils/icons'

import ChaarvyFlex from './chaarvyFlex'

type ColorKey = 'primary' | 'success' | 'error' | 'info' | 'secondary' | 'warning'

export interface ChaarvyButtonProps extends ButtonProps {
  color?: ColorKey
  fillType?: 'solid' | 'gradient'
  leftIcon?: GetChaarvyIconsProps['iconName']
  rightIcon?: GetChaarvyIconsProps['iconName']
  label?: ReactNode
  hoverEffect?: Record<string, any>
  loading?: boolean
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
  loading = false,
  disabled,
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
      // Force white text if color is 'success', otherwise let MUI calculate the best contrast
      base.color = '#ffffff'

      // base.color = color === 'info' ? '#ffffff' : theme.palette.getContrastText(main)

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
      <span style={{ display: 'inline-flex' }}>
        <Button {...props} disabled={loading || disabled} variant={variant} color={color ?? 'primary'} sx={mergedSx}>
          <ChaarvyFlex className={{ gap: 2 }}>
            {loading ? (
              <CircularProgress size='1.25rem' color='inherit' />
            ) : (
              leftIcon && <GetChaarvyIcons fontSize='1.25rem' iconName={leftIcon} />
            )}

            {(label || children) && <Box>{label ?? children}</Box>}

            {rightIcon && <GetChaarvyIcons fontSize='1.25rem' iconName={rightIcon} />}
          </ChaarvyFlex>
        </Button>
      </span>
    </Tooltip>
  )
}

export default ChaarvyButton
