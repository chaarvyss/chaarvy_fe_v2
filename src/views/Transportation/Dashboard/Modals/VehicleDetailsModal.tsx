import { ClipLoader } from 'react-spinners'

import { Box, Grid, Typography } from '@muiElements'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useGetVehicleDetailsQuery } from 'src/store/services/transportServices'

interface VehicleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string
}

const VehicleDetailsModal = ({ isOpen = true, onClose, vehicleId }: VehicleDetailsModalProps) => {
  const { data: vehicleDetails, isLoading = true } = useGetVehicleDetailsQuery(vehicleId, {
    skip: !vehicleId
  })

  const vehicleData = [
    { label: 'Vehicle Number', value: vehicleDetails?.vehicle_number || 'N/A' },
    { label: 'Driver Name', value: vehicleDetails?.driver_name || 'N/A' },
    { label: 'Driver Contact', value: vehicleDetails?.driver_contact || 'N/A' },
    { label: 'Route', value: vehicleDetails?.route || 'N/A' },
    { label: 'Students Onboard', value: vehicleDetails?.students_onboard ?? 'N/A' },
    { label: 'Current Location', value: vehicleDetails?.current_location || 'N/A' }
  ]

  const renderVehicleDetails = () => {
    if (isLoading) {
      return <ClipLoader color={'#1976d2'} loading={true} size={50} aria-label='Loading Spinner' data-testid='loader' />
    }

    if (!vehicleDetails) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography variant='body1'>Vehicle details not found</Typography>
        </Box>
      )
    }

    return (
      <Grid container spacing={2}>
        {vehicleData.map((item, index) => (
          <Grid item xs={6} key={index}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <strong>{item.label}:</strong>
              </Grid>
              <Grid item xs={6}>
                <strong>{item.value}</strong>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <ChaarvyModal modalSize='col-12 col-md-10 col-xl-8' isOpen={isOpen} onClose={onClose} title='Vehicle Details'>
      {renderVehicleDetails()}
    </ChaarvyModal>
  )
}

export default VehicleDetailsModal
