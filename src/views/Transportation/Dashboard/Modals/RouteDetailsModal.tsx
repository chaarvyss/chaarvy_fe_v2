import { ClipLoader } from 'react-spinners'

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@muiElements'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

interface RouteDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  routeId: string
}

const RouteDetailsModal = ({ isOpen = true, onClose, routeId }: RouteDetailsModalProps) => {
  console.log('Route ID for details:', routeId)

  const isLoading = false

  const routeDetails = {
    route_id: 'R001',
    route_name: 'Route A',
    points_with_time: [
      {
        point_name: 'Point A',
        point_id: 'P001',
        morning_arrival_time: '08:00 AM',
        morning_departure_time: '08:15 AM',
        evening_arrival_time: '05:00 PM',
        evening_departure_time: '05:15 PM'
      },
      {
        point_name: 'Point B',
        point_id: 'P002',
        morning_arrival_time: '08:30 AM',
        morning_departure_time: '08:45 AM',
        evening_arrival_time: '05:30 PM',
        evening_departure_time: '05:45 PM'
      }
    ]
  }

  let content: React.ReactNode = null

  if (isLoading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <ClipLoader color='#1976d2' size={50} />
      </Box>
    )
  } else if (!routeDetails) {
    content = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Typography>Route details not found</Typography>
      </Box>
    )
  } else {
    content = (
      <Box>
        <Box sx={{ px: 4, display: 'flex' }}>
          <Typography
            onClick={() => alert(`open map with route id: ${routeId}`)}
            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            variant='h6'
            gutterBottom
          >
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
              {routeDetails.points_with_time.map(item => (
                <TableRow key={item.point_id}>
                  <TableCell
                    onClick={() => alert(`open map with point id: ${item.point_id}`)}
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  >
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
      {content}
    </ChaarvyModal>
  )
}

export default RouteDetailsModal
