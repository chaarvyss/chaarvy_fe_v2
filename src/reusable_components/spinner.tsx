import { ClipLoader } from 'react-spinners'

interface LoadingSpinnerProps {
  color?: string
  size?: number
}

const Spinner = ({ color = '#1976d2', size = 50 }: LoadingSpinnerProps) => {
  return <ClipLoader color={color} loading={true} size={size} aria-label='Loading Spinner' data-testid='loader' />
}

export default Spinner
