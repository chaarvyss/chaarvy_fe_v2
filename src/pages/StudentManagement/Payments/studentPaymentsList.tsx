import { Box, Tooltip } from '@mui/material'

import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { ChaarvyModal } from 'src/reusable_components'
import { useGetPaymentHistoryQuery } from 'src/store/services/feesServices'
import GetChaarvyIcons from 'src/utils/icons'

interface StudentPaymentsListProps {
  isOpen: boolean
  onClose: () => void
  studentEnrollmentId: string
  studentName: string
}

const StudentPaymentsList = ({ isOpen, onClose, studentEnrollmentId, studentName }: StudentPaymentsListProps) => {
  const { data: paymentHistoryData, isFetching: isPaymentHistoryLoading } = useGetPaymentHistoryQuery(
    studentEnrollmentId,
    {
      skip: !studentEnrollmentId
    }
  )
  const columns = [
    { label: '#', id: 'sno' },
    { label: 'Particulars', id: 'particulars' },
    { label: 'Paid on', id: 'paid_on' },
    { label: 'Amount', id: 'amount' },
    { label: 'Mode', id: 'payment_mode' },
    { label: 'Notes', id: 'notes' },
    {
      label: '',
      id: 'reciept',
      render: () => (
        <Tooltip title='Download reciept' placement='top'>
          <Box sx={{ cursor: 'pointer' }} onClick={() => alert('Download reciept functionality coming soon')}>
            <GetChaarvyIcons iconName='Download' color='success' fontSize='1.25rem' />
          </Box>
        </Tooltip>
      )
    }
  ]

  return (
    <ChaarvyModal
      modalSize='col-12 col-md-10 col-lg-8'
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment History - ${studentName}`}
    >
      <Box padding={2}>
        <ChaarvyTable
          tableDataProps={{
            columns: columns,
            data: isPaymentHistoryLoading ? [] : paymentHistoryData,
            getRowKey: row => row.payment_id,
            isLoading: isPaymentHistoryLoading
          }}
        />
      </Box>
    </ChaarvyModal>
  )
}

export default StudentPaymentsList
