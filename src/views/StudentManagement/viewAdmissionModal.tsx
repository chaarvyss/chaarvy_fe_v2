import { LoadingButton } from '@mui/lab'
import { Stack, Typography } from '@mui/material'

import { ChaarvyModal } from 'src/reusable_components'
import { useDropAdmissionMutation } from 'src/store/services/admisissionsService'
import GetChaarvyIcons from 'src/utils/icons'

interface ViewAdmissionModalProps {
  studentId: string
  onClose: () => void
}

const ViewAdmissionModal = ({ studentId, onClose }: ViewAdmissionModalProps) => {
  const [dropAdmission, { isLoading: isDroppingAdmission }] = useDropAdmissionMutation()

  const handleDropOut = () => {
    dropAdmission(studentId)
      .unwrap()
      .then(() => {
        onClose()
      })
  }

  return (
    <ChaarvyModal title='Admission details' shouldRestrictCloseOnOuterClick isOpen={true} onClose={onClose}>
      <>
        <Typography>Coming soon</Typography>
        <Stack direction='row' justifyContent='end'>
          <LoadingButton
            loading={isDroppingAdmission}
            onClick={handleDropOut}
            sx={{ textTransform: 'none' }}
            size='small'
            variant='contained'
            color='error'
          >
            <GetChaarvyIcons iconName='Delete' fontSize='1.25rem' /> Drop student
          </LoadingButton>
        </Stack>
      </>
    </ChaarvyModal>
  )
}

export default ViewAdmissionModal
