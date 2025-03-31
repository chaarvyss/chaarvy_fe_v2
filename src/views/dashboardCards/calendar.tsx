import { Button, useTheme } from '@mui/material'
import { lightBlue, orange, blue, purple, lightGreen, green } from '@mui/material/colors'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Box, Typography } from '@muiElements'
import React, { useEffect } from 'react'
import { useSettings } from 'src/@core/hooks/useSettings'
import dayjs, { Dayjs } from 'dayjs'
import { useLazyGetUserCalenderQuery } from 'src/store/services/viewServices'
import { useLazyGetEventsListQuery, useLazyGetGoogleAuthUrlQuery } from 'src/store/services/calenderServices'
import { formatEventDate } from 'src/utils/helpers'

const MyCalendar = () => {
  const { settings } = useSettings()
  const theme = useTheme()
  const [date, setDate] = React.useState<Dayjs | null>(dayjs())
  const [fetchCalenderId, { data: calenderDetails }] = useLazyGetUserCalenderQuery()

  const [getIntegrationUrl] = useLazyGetGoogleAuthUrlQuery()
  const [fetchCalenderEvents, { data: eventsList }] = useLazyGetEventsListQuery()

  useEffect(() => {
    fetchCalenderId()
  }, [])

  useEffect(() => {
    if (calenderDetails?.calender_id) {
      fetchCalenderEvents(calenderDetails?.calender_id)
    }
  }, [calenderDetails])

  const colors = {
    light: [lightBlue[100], lightBlue[200]],
    dark: [orange[800], orange[900]]
  }

  const handleLogin = async () => {
    const result = await getIntegrationUrl().unwrap()
    if (result.auth_url) {
      window.location.href = result.auth_url
    } else {
      console.error('Failed to get auth URL')
    }
  }

  const getEventCardColors = () => {
    return settings.mode == 'light' ? [lightGreen[100], lightGreen.A200] : [green[900], green[600]]
  }

  return (
    <Box display='flex' className='flex-column flex-xl-row'>
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
        <Box height='100%' width='100%' display='flex' flexDirection='column'>
          {calenderDetails?.calender_id ? (
            <Box display='flex' justifyContent='center' flexDirection='column'>
              {(eventsList ?? []).length > 0 ? (
                eventsList?.map(each => (
                  <Box
                    display='flex'
                    flexDirection='column'
                    padding={2}
                    marginTop={2}
                    sx={{
                      background: `linear-gradient(to top, ${getEventCardColors().join(', ')})`
                    }}
                    bgcolor={purple[100]}
                    borderRadius='.5rem'
                    boxShadow={theme.shadows[3]}
                  >
                    <Typography>{each.summary}</Typography>
                    <Typography>{formatEventDate({ start: each.start, end: each.end })}</Typography>
                  </Box>
                ))
              ) : (
                <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                  <Typography>No Events Today</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <>
              <Typography align='center'>Calender Not Integrated. Click below button to Integrate</Typography>
              <Button onClick={handleLogin} className='mt-4' variant='contained'>
                Ingegrate
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default MyCalendar
