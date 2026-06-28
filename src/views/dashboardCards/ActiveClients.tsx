import { Box, CardContent, Typography, Stack, Chip } from '@mui/material'

const ActiveClients = () => {
  return (
    <CardContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
          <Box>
            <Typography variant='h4' fontWeight='bold' sx={{ color: '#2c3e50' }}>
              9999
            </Typography>
          </Box>
          <Chip label='▲ +4.2%' color='success' size='small' variant='outlined' sx={{ fontWeight: 'bold' }} />
        </Stack>
        <Stack gap={1}>
          <Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body1'>Active admissions</Typography>
              <Typography fontWeight='bold' variant='body1'>
                21212
              </Typography>
            </Stack>
            <Typography variant='caption' color='green'>
              ▲ +4.2%
            </Typography>
          </Stack>
          <Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body1'>Gross revenue</Typography>
              <Typography fontWeight='bold' variant='body1'>
                ₹21212.00
              </Typography>
            </Stack>
            <Typography variant='caption' color='green'>
              ▲ +4.2%
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </CardContent>
  )
}

export default ActiveClients
