import { Box, useTheme } from '@mui/material'
import { useSettings } from 'src/@core/hooks/useSettings'

interface GradientBoxProps {
  colors: string[] // Array of colors for the gradient
  direction?: string // Gradient direction, e.g., "to right", "to bottom"
  children?: React.ReactNode // Content inside the box
}

export default function GradientBox({ colors, direction = '45deg', children }: GradientBoxProps) {
  const { settings } = useSettings()

  const theme = useTheme()

  return (
    <Box
      sx={{
        borderRadius: theme.shape.borderRadius,
        background: `linear-gradient(${direction}, ${colors.join(', ')})`,
        color: settings.mode === 'dark' ? '#fff' : '#000',
        boxShadow: theme.shadows[1]
      }}
    >
      {children}
    </Box>
  )
}
