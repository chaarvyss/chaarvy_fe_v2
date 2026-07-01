import { CardContent, Typography, Stack, Chip } from '@mui/material'

const DropClients = () => {
  return (
    <CardContent>
      <Stack>
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='h3' fontWeight='bold' sx={{ color: '#2c3e50' }}>
            3
          </Typography>
          <Chip label='▲ +4.2%' color='error' size='small' variant='outlined' sx={{ fontWeight: 'bold' }} />
        </Stack>
        <Stack gap={1}>
          <Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body1'>Admissions Lost</Typography>
              <Typography fontWeight='bold' variant='body1'>
                21212
              </Typography>
            </Stack>
            <Typography variant='caption' color='red'>
              ▲ +4.2%
            </Typography>
          </Stack>
          <Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body1'>Revenue lossed</Typography>
              <Typography fontWeight='bold' variant='body1'>
                ₹21212.00
              </Typography>
            </Stack>
            <Typography variant='caption' color='red'>
              ▲ +4.2%
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </CardContent>
  )
}

export default DropClients
