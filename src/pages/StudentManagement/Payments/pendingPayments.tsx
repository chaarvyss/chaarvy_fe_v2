import { useState } from 'react'

import { Card, Typography, TextField, Box, Grid } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import LoadingSpinner from 'src/reusable_components/LoadingSpinner'
import { StudentPendingFeesDetails, useLazyGetStudentPendingFeesDetailsQuery } from 'src/store/services/feesServices'

import CollectPaymentModal from './collectPaymentModal'
import StudentPaymentsList from './studentPaymentsList'

const CollectPayment = () => {
  const [admissionNumber, setAdmissionNumber] = useState('')

  const [selectedFeesDetail, setSelectedFeesDetail] = useState<StudentPendingFeesDetails>()

  const [showPaymentListModal, setShowPaymentListModal] = useState(false)
  const [showCollectPaymentModal, setShowCollectPaymentModal] = useState(false)

  const { triggerToast } = useToast()

  const [fetchDetails, { data: studentPendingFeesDetails, isFetching: isFetchingData }] =
    useLazyGetStudentPendingFeesDetailsQuery()

  const handleSearch = async () => {
    try {
      await fetchDetails(admissionNumber).unwrap()
    } catch (err) {
      triggerToast('Details not found', {
        variant: ToastVariants.ERROR
      })
    }
  }

  const handleModalOpen = (feesDetail: StudentPendingFeesDetails, modal: 'list' | 'collect') => {
    setSelectedFeesDetail(feesDetail)
    if (modal === 'list') {
      setShowPaymentListModal(true)
    } else {
      setShowCollectPaymentModal(true)
    }
  }

  const handleModalClose = () => {
    setSelectedFeesDetail(undefined)
    setShowPaymentListModal(false)
    setShowCollectPaymentModal(false)
  }

  const columns: ChaarvyTableColumn[] = [
    { label: 'Course Name', id: 'program_name' },
    { label: 'Segment', id: 'segment_name' },
    { label: 'Medium', id: 'medium_name' },
    { label: 'Section', id: 'section_name' },
    { label: 'Total', id: 'total' },
    {
      label: 'Paid',
      id: 'paid',
      render: rowData => (
        <Typography
          sx={{ cursor: 'pointer' }}
          onClick={() => handleModalOpen(rowData, 'list')}
          color={rowData.paid > 0 ? 'success.main' : 'error'}
        >
          {rowData.paid}
        </Typography>
      )
    },
    {
      label: 'Pending',
      id: 'pending',
      render: rowData => (
        <Typography
          sx={{ cursor: 'pointer' }}
          onClick={() => handleModalOpen(rowData, 'collect')}
          color={rowData.pending > 0 ? 'error' : 'success.main'}
        >
          {rowData.pending}
        </Typography>
      )
    }
  ]

  const fields = [
    ['Admission Number', studentPendingFeesDetails?.admission_number],
    ['Father Name', studentPendingFeesDetails?.father_name],
    ['Student Name', studentPendingFeesDetails?.student_name]
  ]

  return (
    <Card>
      <>
        <Box display='flex' justifyContent='space-between' alignItems='center' gap={2} mt={2} padding={2}>
          <Typography variant='h6'>Collect Payment</Typography>
          <Box display='flex' gap={2} alignItems='center'>
            <TextField
              label='Admission Number'
              value={admissionNumber}
              size='small'
              type='search'
              onChange={e => setAdmissionNumber(e.target.value)}
            />
            <ChaarvyButton color='primary' onClick={handleSearch}>
              Search
            </ChaarvyButton>
          </Box>
        </Box>

        {isFetchingData && <LoadingSpinner />}
        {!isFetchingData && studentPendingFeesDetails && (
          <Box gap={2} padding={2} height='68vh' overflow='auto' display='flex' flexDirection='column'>
            <Grid
              container
              spacing={4}
              sx={{
                background: `
                  linear-gradient(
                    to bottom,
                    #dff6ff 0%,
                    #bfe8ff 25%,
                    #e8f4f8 60%,
                    #cfe7e6 100%
                  )
                `,
                marginY: 3,
                borderRadius: 2,
                p: 3
              }}
            >
              {fields.map(([label, value]) => (
                <Grid item xs={12} lg={6} xl={4} key={label}>
                  <Grid container>
                    <Grid item xs={4}>
                      <Typography fontWeight={600}>{label}</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{value || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <ChaarvyTable
              tableDataProps={{
                data: studentPendingFeesDetails?.fees_details || [],
                columns,
                getRowKey: row => row.student_course_enrollment_id
              }}
            />
          </Box>
        )}
        {selectedFeesDetail && (
          <>
            <CollectPaymentModal
              isOpen={showCollectPaymentModal}
              onClose={handleModalClose}
              details={selectedFeesDetail}
            />
            <StudentPaymentsList
              isOpen={showPaymentListModal}
              onClose={handleModalClose}
              studentEnrollmentId={selectedFeesDetail.student_course_enrollment_id}
              studentName={studentPendingFeesDetails?.admission_number || ''}
            />
          </>
        )}
      </>
    </Card>
  )
}

export default CollectPayment
