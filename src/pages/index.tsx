import { Box, Typography } from '@muiElements'
import { useEffect } from 'react'
import { useImageViewer } from 'src/@core/context/imageViewerContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useLazyGetCollegeDetailsQuery } from 'src/store/services/viewServices'
// import MydetailsModal from 'src/views/modals/mydetailsModal'

const Dashboard = () => {
  // const [showMyDetailsModal, setShowMyDetailsModal] = useState<boolean>(true)
  const [fetchCollegeDetails] = useLazyGetCollegeDetailsQuery()
  const { settings, saveSettings } = useSettings()

  const { setShowImage } = useImageViewer()

  if (setShowImage) {
    // setShowImage('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM2guPxlYZHQsdR4lJjsG8RIixgvixkDcD7A&s')
    setShowImage('')
  }

  useEffect(() => {
    fetchCollegeDetails()
      .unwrap()
      .then(collegeDetails => {
        saveSettings({
          ...settings,
          college_name: collegeDetails.college_name ?? '',
          campus_name: collegeDetails.campus_name ?? '',
          college_code: collegeDetails.college_code ?? '',
          college_logo: collegeDetails.college_logo ?? undefined
        })
      })
  }, [])

  return (
    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
      {/* <MydetailsModal isOpen={showMyDetailsModal} details={mydetails} /> */}
      <Typography variant='h2'>Hi {settings.current_username ?? 'User'} </Typography>
      <Typography variant='h3'>Welcome to Chaarvy Software solutions</Typography>
      <Typography variant='body1'>We are coming soon with Dashboard</Typography>
    </Box>
  )
}

export default Dashboard
