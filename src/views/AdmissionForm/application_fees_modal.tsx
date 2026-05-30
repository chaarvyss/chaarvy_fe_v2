import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'

import { Box, Typography, Button } from '@muiElements'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

interface ApplicationFeesModalProps {
  isOpen: boolean
  isLoading: boolean
  onCollectClick: () => void
  processingFees: number
  onClose: () => void
}

const ApplicationFeesModal = ({
  isOpen,
  isLoading,
  onCollectClick,
  processingFees,
  onClose
}: ApplicationFeesModalProps) => {
  return (
    <ChaarvyModal isOpen={isOpen} title='Application Processing Fees' shouldRestrictCloseOnOuterClick>
      <Box padding={2} gap={3}>
        <Typography variant='body1'>
          Application Processing Fees of Rupees {processingFees}.00/- will be collected.
        </Typography>
        {isLoading && (
          <Typography marginTop={3} variant='body1'>
            Page will redirect in a moment. Please wait...
          </Typography>
        )}
        <Stack direction='row' gap={3} justifyContent='center' alignItems='center' marginTop={4}>
          <Button variant='outlined' color='error' onClick={onClose}>
            Skip now
          </Button>

          <LoadingButton loading={isLoading} variant='outlined' onClick={onCollectClick}>
            Proceed to Pay
          </LoadingButton>
        </Stack>
      </Box>
    </ChaarvyModal>
  )
}

export default ApplicationFeesModal
