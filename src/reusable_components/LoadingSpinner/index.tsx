import { Stack, Typography } from '@mui/material'
import { ClipLoader } from 'react-spinners'

const LoadingSpinner = () => {
  return (
    <Stack justifyContent='center' alignItems='center' sx={{ height: '40vh' }}>
      <ClipLoader color={'#1976d2'} loading={true} size={50} aria-label='Loading Spinner' data-testid='loader' />
      <Typography>Loading data...</Typography>
    </Stack>
  )
}

export default LoadingSpinner
