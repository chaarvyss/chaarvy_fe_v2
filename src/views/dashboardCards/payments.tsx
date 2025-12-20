import { Box, Typography, useTheme } from '@mui/material'
import { blue, green, lightBlue, lightGreen, orange, red, yellow } from '@mui/material/colors'
import { useState, useRef, useEffect } from 'react'

import { useSettings } from 'src/@core/hooks/useSettings'
import GetChaarvyIcons from 'src/utils/icons'

const pay = [
  {
    title: 'Collected',
    value: 3200,
    colors: {
      light: [lightGreen[100], lightGreen.A200],
      dark: [green[900], green[600]]
    },
    iconName: 'CurrencyRupee' as const,
    iconColor: green[900]
  },
  {
    title: 'Today',
    value: 3200,
    colors: {
      light: [lightBlue[100], lightBlue[200]],
      dark: [lightBlue[900], lightBlue.A400]
    },
    iconName: 'CalendarToday' as const,
    iconColor: blue[900]
  },
  {
    title: 'Due',
    value: 3200,
    colors: {
      light: [yellow[100], yellow.A200],
      dark: [yellow[900], yellow.A400]
    },
    iconName: 'CreditCardClock' as const,
    iconColor: red[900]
  },
  {
    title: 'Overdue',
    value: 3200,
    colors: {
      light: [orange[100], orange.A200],
      dark: [orange[800], orange[900]]
    },
    iconName: 'Alert' as const,
    iconColor: red[900]
  }
]

export default function PaymentBoxes() {
  const { settings } = useSettings()
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [maxWidth, setMaxWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      let maxBoxWidth = 0
      entries.forEach(entry => {
        maxBoxWidth = Math.max(maxBoxWidth, entry.contentRect.width)
      })
      setMaxWidth(maxBoxWidth)
    })

    containerRef.current.querySelectorAll('.pay-box').forEach(box => {
      resizeObserver.observe(box)
    })

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <Box ref={containerRef} display='flex' justifyContent='space-around' flexWrap='wrap' gap={3}>
      {pay.map((each, index) => (
        <Box
          key={index}
          className='pay-box'
          padding={3}
          display='flex'
          justifyContent='center'
          alignItems='center'
          flexDirection='column'
          sx={{
            width: maxWidth || 'auto',
            minWidth: 135,
            background: `linear-gradient(to right, ${(settings.mode === 'light'
              ? each.colors.light
              : each.colors.dark
            ).join(', ')})`,
            borderRadius: '.5rem',
            boxShadow: theme.shadows[1]
          }}
        >
          <GetChaarvyIcons color={each.iconColor} iconName={each.iconName} fontSize='2.5rem' />
          <Typography variant='h4' color={settings.mode === 'dark' ? 'white' : each.iconColor}>
            {each.value}
          </Typography>
          <Typography>{each.title}</Typography>
        </Box>
      ))}
    </Box>
  )
}
