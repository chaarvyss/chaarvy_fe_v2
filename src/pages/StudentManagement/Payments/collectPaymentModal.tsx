import { LoadingButton } from '@mui/lab'
import { CircularProgress, MenuItem, Select, SelectChangeEvent, TextField, Typography, Box } from '@mui/material'
import { useState } from 'react'
import { DatePicker } from 'react-datepicker'

import { FormControl } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ChaarvyModal } from 'src/reusable_components'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import {
  StudentPendingFeesDetails,
  useGetPaymentRecieptByPaymentIdMutation,
  useRecordPaymentTransactionMutation
} from 'src/store/services/feesServices'
import { printDocument } from 'src/utils/helpers'

interface CollectPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  details: StudentPendingFeesDetails
}

const CollectPaymentModal = ({ isOpen, onClose, details }: CollectPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [amount, setAmount] = useState<number>()
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date())
  const [notes, setNotes] = useState('')

  const { triggerToast } = useToast()
  const [recordTransaction, { isLoading: isRecordingTxn }] = useRecordPaymentTransactionMutation()

  const [fetchPaymentReciept, { isLoading: isFetchingPaymentReciept }] = useGetPaymentRecieptByPaymentIdMutation()

  const handleRecieptDownload = async (payment_id: string) => {
    fetchPaymentReciept(payment_id)
      .unwrap()
      .then(pdfBlob => {
        if (!pdfBlob) return

        const url = globalThis.window.URL.createObjectURL(pdfBlob)
        printDocument(url)
        onClose()
      })
      .catch(() => {
        triggerToast('Failed to generate reciept', {
          variant: ToastVariants.ERROR
        })
      })
  }

  const menuOptions = [{ value: 1, label: 'Cash' }]

  const isLoading = isFetchingPaymentReciept || isRecordingTxn

  const handlePaymentMethodChange = (event: SelectChangeEvent<string>) => {
    setPaymentMethod(event.target.value as string)
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value))
  }

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value)
  }

  const handleSubmit = async () => {
    if (!amount || !paymentMethod) return

    recordTransaction({
      amount,
      payment_mode: paymentMethod,
      student_course_enrollment_id: details.student_course_enrollment_id,
      payment_date: paymentDate ?? undefined,
      notes: notes || undefined
    })
      .unwrap()
      .then(({ payment_id }) => {
        triggerToast('Payment recorded successfully', {
          variant: ToastVariants.SUCCESS
        })
        handleRecieptDownload(payment_id)
      })
      .catch(err => {
        triggerToast(err, {
          variant: ToastVariants.ERROR
        })
      })
  }

  return (
    <ChaarvyModal title='Collect Fees' onClose={onClose} isOpen={isOpen} shouldRestrictCloseOnOuterClick>
      <Box gap={2} display='flex' flexDirection='column' justifyContent='center' padding={2}>
        {isFetchingPaymentReciept ? (
          <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
            <CircularProgress />
            <Typography ml={2}>Generating reciept...</Typography>
          </Box>
        ) : (
          <>
            <Typography>Pending Fees: {details.pending}</Typography>
            <Box>
              <small>Amount</small>
              <TextField
                inputProps={{ min: 0, max: details.pending }}
                fullWidth
                size='small'
                value={amount}
                type='number'
                error={!!amount && (amount < 0 || amount > details.pending)}
                onChange={handleAmountChange}
              />
            </Box>

            <FormControl fullWidth>
              <small>Payment Method</small>
              <Select value={paymentMethod} size='small' onChange={handlePaymentMethodChange}>
                {isLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={24} />
                  </MenuItem>
                ) : (
                  (menuOptions ?? []).map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <Box display='flex' flexDirection='column'>
              <small>Payment date</small>
              <DatePicker
                customInput={<CustomDateElement size='small' label='' />}
                selected={paymentDate}
                onChange={setPaymentDate}
              />
            </Box>
            <Box>
              <small>Notes</small>
              <TextField
                inputProps={{ min: 0, max: details.pending }}
                fullWidth
                size='small'
                value={notes}
                multiline
                rows={4}
                error={notes.length > 500}
                onChange={handleNotesChange}
              />
            </Box>
            <Box display='flex' justifyContent='center' gap={2} mt={2}>
              <LoadingButton
                disabled={!paymentMethod || !amount || amount <= 0 || amount > details.pending}
                variant='contained'
                loading={isRecordingTxn}
                onClick={handleSubmit}
              >
                Collect Payment
              </LoadingButton>
            </Box>
          </>
        )}
      </Box>
    </ChaarvyModal>
  )
}

export default CollectPaymentModal
