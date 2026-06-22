import { LoadingButton } from '@mui/lab'
import { Stack, Card, Box, Typography } from '@mui/material'

import { useStudentAdmissionsReportMutation } from 'src/store/services/reportServices'
import { downloadDocument } from 'src/utils/helpers'

const Reports = () => {
  const [getStudentAdmissions, { isLoading: isFetchingReport }] = useStudentAdmissionsReportMutation()

  const reports = [
    {
      label: 'Student admissions',
      status: undefined
    },
    {
      label: 'Dropouts',
      status: '0'
    }
  ]

  const handleDownload = async (status?: string) => {
    const blob = await getStudentAdmissions(status).unwrap()

    const url = window.URL.createObjectURL(blob)
    downloadDocument(url, status == '0' ? 'Dropouts' : 'Student Admissions')
  }

  return (
    <Box>
      <Typography variant='h5' textAlign='center'>
        Reports
      </Typography>
      <Stack direction='row' flexWrap='wrap' gap={3}>
        {reports.map(each => (
          <LoadingButton
            disabled={isFetchingReport}
            loading={isFetchingReport}
            onClick={() => handleDownload(each.status)}
          >
            <Card sx={{ p: 3, cursor: 'pointer', textTransform: 'none' }}>{each.label}</Card>
          </LoadingButton>
        ))}
      </Stack>
    </Box>
  )
}

export default Reports
