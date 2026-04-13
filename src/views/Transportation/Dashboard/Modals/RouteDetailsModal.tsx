import { ClipLoader } from 'react-spinners'

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@muiElements'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

interface RouteDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  routeId: string
}

const RouteDetailsModal = ({ isOpen = true, onClose, routeId }: RouteDetailsModalProps) => {
  //   const { data: routeDetails, isLoading = true } = useGetRouteDetailsQuery(routeId, {
  //     skip: !routeId
  //   })

  console.log('Route ID for details:', routeId)

  const isLoading = false

  const routeDetails = {
    route_id: 'R001',
    route_name: 'Route 1',
    points_with_time: [
      {
        point_name: 'Point A',
        morning_arrival_time: '08:00 AM',
        morning_departure_time: '08:15 AM',
        evening_arrival_time: '05:00 PM',
        evening_departure_time: '05:15 PM'
      },
      {
        point_name: 'Point B',
        morning_arrival_time: '08:30 AM',
        morning_departure_time: '08:45 AM',
        evening_arrival_time: '05:30 PM',
        evening_departure_time: '05:45 PM'
      }
    ]
  }

  const renderRouteDetails = () => {
    if (isLoading) {
      return <ClipLoader color={'#1976d2'} loading={true} size={50} aria-label='Loading Spinner' data-testid='loader' />
    }

    if (!routeDetails) {
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
          <Typography variant='body1'>Route details not found</Typography>
        </Box>
      )
    }

    return (
      <Box>
        <Box>
          <Typography variant='h6' gutterBottom>
            {routeDetails.route_name}
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Point Name</TableCell>
                <TableCell>Morning Arrival</TableCell>
                <TableCell>Morning Departure</TableCell>
                <TableCell>Evening Arrival</TableCell>
                <TableCell>Evening Departure</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routeDetails.points_with_time.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <strong>{item.point_name}</strong>
                  </TableCell>
                  <TableCell>{item.morning_arrival_time}</TableCell>
                  <TableCell>{item.morning_departure_time}</TableCell>
                  <TableCell>{item.evening_arrival_time}</TableCell>
                  <TableCell>{item.evening_departure_time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )
  }

  return (
    <ChaarvyModal modalSize='col-12 col-md-10 col-xl-8' isOpen={isOpen} onClose={onClose} title='Route Details'>
      {renderRouteDetails()}
    </ChaarvyModal>
  )
}

export default RouteDetailsModal
