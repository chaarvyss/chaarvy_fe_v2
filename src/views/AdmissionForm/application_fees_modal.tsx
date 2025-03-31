import { LoadingButton } from '@mui/lab'
import { Box, Typography, Button } from '@muiElements'
import React from 'react'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

interface ApplicationFeesModalProps {
  isOpen: boolean
  isLoading: boolean
  onCollectClick: () => void
}

const ApplicationFeesModal = (data: ApplicationFeesModalProps) => {
  const { isOpen, isLoading, onCollectClick } = data
  return (
    <ChaarvyModal isOpen={isOpen} title='Application Processing Fees' shouldRestrictCloseOnOuterClick>
      <Box padding={2} gap={3}>
        <Typography variant='body1'>Application Processing Fees of Rupees 495.00/- will be collected.</Typography>
        {isLoading && (
          <Typography marginTop={3} variant='body1'>
            Page will redirect in a moment. Please wait...
          </Typography>
        )}
        <Box display='flex' justifyContent='center' alignItems='center' marginTop={4}>
          {isLoading ? <LoadingButton loading disabled /> : <Button onClick={onCollectClick}>Proceed to Pay</Button>}
        </Box>
      </Box>
    </ChaarvyModal>
  )
}

export default ApplicationFeesModal
