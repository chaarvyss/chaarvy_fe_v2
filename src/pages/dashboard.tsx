import { Box, Typography } from '@muiElements'
import { useEffect } from 'react'
import { useImageViewer } from 'src/@core/context/imageViewerContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useLazyGetCollegeDetailsQuery } from 'src/store/services/viewServices'

const Dashboard = () => {
  // const [showMyDetailsModal, setShowMyDetailsModal] = useState<boolean>(true)

  const { settings, saveSettings } = useSettings()

  const { setShowImage } = useImageViewer()

  if (setShowImage) {
    setShowImage('')
  }

  return (
    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
      <Typography variant='h2'>Hi {settings.current_username ?? 'User'} </Typography>
      <Typography variant='h3'>Welcome to Chaarvy Software solutions</Typography>
      <Typography variant='body1'>We are coming soon with Dashboard</Typography>
    </Box>
  )
}

export default Dashboard
