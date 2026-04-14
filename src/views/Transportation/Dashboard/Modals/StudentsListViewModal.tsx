import { ClipLoader } from 'react-spinners'

import {
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@muiElements'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

interface StudentsListViewModalProps {
  isOpen: boolean
  onClose: () => void
  routeId: string
}

const statusColorMap: Record<string, string> = {
  Onboard: 'green',
  Absent: 'red',
  Waiting: 'orange'
}

const StudentsListViewModal = ({ isOpen = true, onClose, routeId }: StudentsListViewModalProps) => {
  console.log('Route ID for details:', routeId)

  const isLoading = false

  const routeDetails = {
    route_id: 'R001',
    route_name: 'Route 1',
    vehicle_number: 'Bus 101',
    student_boarding_point_with_status: [
      { student_id: 'S001', student_name: 'John Doe', boarding_point: 'Point A', status: 'Onboard' },
      { student_id: 'S002', student_name: 'Jane Smith', boarding_point: 'Point B', status: 'Onboard' },
      { student_id: 'S003', student_name: 'Jane Smith', boarding_point: 'Point B', status: 'Absent' },
      { student_id: 'S004', student_name: 'Jane Smith', boarding_point: 'Point B', status: 'Waiting' }
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>No students in this route</Typography>
      </Box>
    )
  } else {
    content = (
      <Box>
        <Grid container spacing={2} sx={{ mb: 2, px: 4, border: '1px solid #e8e8e8', borderRadius: 1 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant='h6'>Route Name:</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant='h6'>{routeDetails.route_name}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant='h6'>Vehicle Number:</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant='h6'>{routeDetails.vehicle_number}</Typography>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Boarding Point</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {routeDetails.student_boarding_point_with_status.map(item => (
                <TableRow key={item.student_id}>
                  <TableCell
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={() => alert(`nav to ${item.student_id}`)}
                  >
                    <strong>{item.student_name}</strong>
                  </TableCell>

                  <TableCell>{item.boarding_point}</TableCell>

                  <TableCell>
                    <Chip
                      label={item.status}
                      sx={{
                        backgroundColor: statusColorMap[item.status] || 'gray',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )
  }

  return (
    <ChaarvyModal modalSize='col-12 col-md-10 col-xl-8' isOpen={isOpen} onClose={onClose} title='Students in Route'>
      {content}
    </ChaarvyModal>
  )
}

export default StudentsListViewModal
