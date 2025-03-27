import { useTheme } from '@mui/material'
import { lightBlue, orange, blue } from '@mui/material/colors'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Box, Typography } from '@muiElements'
import React, { useState } from 'react'
import { useSettings } from 'src/@core/hooks/useSettings'
import dayjs, { Dayjs } from 'dayjs'

const MyCalendar = () => {
  const { settings } = useSettings()
  const theme = useTheme()

  const [date, setDate] = React.useState<Dayjs | null>(dayjs())

  const colors = {
    light: [lightBlue[100], lightBlue[200]],
    dark: [orange[800], orange[900]]
  }
  return (
    <Box display='flex'>
      <Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar value={date} onChange={newDate => setDate(newDate)} />
        </LocalizationProvider>
      </Box>
      <Box display='flex' flexDirection='column' alignItems='center' width='100%'>
        <Box
          width='100%'
          sx={{
            background: `linear-gradient(to right, ${(settings.mode === 'light' ? colors.light : colors.dark).join(
              ', '
            )})`,
            borderRadius: '.5rem',
            boxShadow: theme.shadows[1]
          }}
        >
          <Typography
            color={settings.mode === 'light' ? blue[900] : colors[100]}
            textAlign='center'
            padding={2}
            variant='h6'
          >
            Today Events
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default MyCalendar
