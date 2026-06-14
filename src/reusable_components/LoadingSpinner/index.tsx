import { Stack, Typography } from '@mui/material'
import { ClipLoader } from 'react-spinners'

interface LoadingSpinnerProps {
  loadingText?: string
  color?: string
}

const LoadingSpinner = ({ loadingText = 'Loading data...', color = '#1976d2' }: LoadingSpinnerProps) => {
  return (
    <Stack justifyContent='center' alignItems='center' sx={{ height: '40vh' }}>
      <ClipLoader color={color} loading={true} size={50} aria-label='Loading Spinner' data-testid='loader' />
      <Typography>{loadingText}</Typography>
    </Stack>
  )
}

export default LoadingSpinner
