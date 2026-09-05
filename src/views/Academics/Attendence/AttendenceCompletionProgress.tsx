import { Tooltip } from '@mui/material'

import { Box, Typography } from '@muiElements'

const AttendenceCompletionProgress = ({ studentsListResponse }: { studentsListResponse: any[] }) => {
  const totalStudents = studentsListResponse.length
  const presentCount = studentsListResponse.filter(student => student.status === 1).length
  const absentCount = studentsListResponse.filter(student => student.status === 0).length
  const pendingCount = studentsListResponse.filter(student => student.status === 2).length

  // Prevent division by zero if there are no students
  const safeTotal = totalStudents > 0 ? totalStudents : 1

  const presentPct = `${(presentCount / safeTotal) * 100}%`
  const absentPct = `${(absentCount / safeTotal) * 100}%`
  const pendingPct = `${(pendingCount / safeTotal) * 100}%`

  return (
    <Box sx={{ width: '80%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Optional: Keep a small summary row above the bar for quick reading */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='caption' color='text.secondary' fontWeight={600}>
          Total: {totalStudents}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Typography variant='caption' sx={{ color: 'success.main', fontWeight: 600 }}>
            Present: {presentCount}
          </Typography>
          <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600 }}>
            Absent: {absentCount}
          </Typography>
          <Typography variant='caption' sx={{ color: 'warning.main', fontWeight: 600 }}>
            Pending: {pendingCount}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          height: 6, // Adjust thickness here
          width: '100%',
          borderRadius: 4, // Fully rounded edges
          overflow: 'hidden',
          bgcolor: 'grey.200' // Background color for empty space
        }}
      >
        <Tooltip title={`Present: ${presentCount}`} placement='top' arrow>
          <Box sx={{ width: presentPct, bgcolor: 'success.main', transition: 'width 0.3s ease' }} />
        </Tooltip>

        <Tooltip title={`Absent: ${absentCount}`} placement='top' arrow>
          <Box sx={{ width: absentPct, bgcolor: 'error.main', transition: 'width 0.3s ease' }} />
        </Tooltip>

        <Tooltip title={`Pending: ${pendingCount}`} placement='top' arrow>
          <Box sx={{ width: pendingPct, bgcolor: 'warning.main', transition: 'width 0.3s ease' }} />
        </Tooltip>
      </Box>
    </Box>
  )
}

export default AttendenceCompletionProgress
