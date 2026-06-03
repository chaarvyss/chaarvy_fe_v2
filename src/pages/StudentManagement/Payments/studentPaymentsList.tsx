import { Box, Tooltip, Typography } from '@mui/material'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { ChaarvyModal } from 'src/reusable_components'
import { useGetPaymentHistoryQuery, useGetPaymentRecieptByPaymentIdMutation } from 'src/store/services/feesServices'
import { printDocument } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'

interface StudentPaymentsListProps {
  isOpen: boolean
  onClose: () => void
  studentEnrollmentId: string
  studentName: string
}

const StudentPaymentsList = ({ isOpen, onClose, studentEnrollmentId, studentName }: StudentPaymentsListProps) => {
  const { triggerToast } = useToast()

  const [fetchPaymentReciept, { isLoading: isFetchingPaymentReciept }] = useGetPaymentRecieptByPaymentIdMutation()

  const { data: paymentHistoryData, isFetching: isPaymentHistoryLoading } = useGetPaymentHistoryQuery(
    studentEnrollmentId,
    {
      skip: !studentEnrollmentId || studentEnrollmentId === ''
    }
  )

  const handleRecieptDownload = async (payment_id: string) => {
    fetchPaymentReciept(payment_id)
      .unwrap()
      .then(pdfBlob => {
        if (!pdfBlob) return

        const url = globalThis.window.URL.createObjectURL(pdfBlob)
        printDocument(url)
      })
      .catch(() => {
        triggerToast('Failed to generate reciept', {
          variant: ToastVariants.ERROR
        })
      })
  }

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
      render: (row: any) => (
        <Tooltip title='Download reciept' placement='top'>
          <Box sx={{ cursor: 'pointer' }} onClick={() => handleRecieptDownload(row.payment_id)}>
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
        {isFetchingPaymentReciept && (
          <Typography variant='body2' color='textSecondary'>
            Generating reciept...
          </Typography>
        )}
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
