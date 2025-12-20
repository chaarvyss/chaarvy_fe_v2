import { LoadingButton } from '@mui/lab'
import { CircularProgress, Grid, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React, { ChangeEvent, useState } from 'react'
import DatePicker from 'react-datepicker'

import {
  Box,
  Button,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import {
  StudentPayableFeesRequest,
  StudentProgramFeesDetailsResponse,
  useCreateStudentPayableFeesMutation
} from 'src/store/services/feesServices'
import { useGetPaymentAggrementsQuery } from 'src/store/services/listServices'
import { GetSumOfNumbers } from 'src/utils/helpers'

interface Props {
  feesDetails?: StudentProgramFeesDetailsResponse
  isOpen: boolean
  onClose: (isSuccess?: boolean) => void
  application_id?: string
  segment_id?: string
}

interface TermsDetail {
  payable_fees: number
  due_date: Date
}

const PaymentFinaliseModal = ({ feesDetails, isOpen, onClose, application_id, segment_id }: Props) => {
  const [createStudentPayableFees, { isLoading }] = useCreateStudentPayableFeesMutation()
  const { triggerToast } = useToast()

  const [terms, setTerms] = useState<TermsDetail[]>([])

  const { data: paymentAggrements } = useGetPaymentAggrementsQuery()

  const [paymentAggrement, setPaymentAggrement] = useState<StudentPayableFeesRequest>()

  const fees = [
    {
      particular: 'Program Fees',
      totalFees: GetSumOfNumbers(feesDetails?.prg_fees?.map(each => each.fees) || []),
      discount: GetSumOfNumbers(feesDetails?.prg_fees?.map(each => each.discount) || [])
    },
    {
      particular: 'Addon Course',
      totalFees: GetSumOfNumbers(feesDetails?.addonCourse?.map(each => each.addon_coures_fees) || []),
      discount: GetSumOfNumbers(feesDetails?.addonCourse?.map(each => each.discount) || [])
    },
    {
      particular: 'Books',
      totalFees: GetSumOfNumbers(feesDetails?.books?.map(each => each.Total) || []),
      discount: 0
    }
  ]

  const consolidatedFees = fees.reduce(
    (acc, { totalFees, discount }) => {
      acc.totalFees += totalFees
      acc.totalDiscount += discount

      return acc
    },
    { totalFees: 0, totalDiscount: 0 }
  )

  const handleSubmit = () => {
    if (application_id && segment_id) {
      createStudentPayableFees({
        application_id,
        fees_details: JSON.stringify(feesDetails),
        payable_fees: consolidatedFees.totalFees - consolidatedFees.totalDiscount,
        segment_id,
        ...paymentAggrement,
        term_details: paymentAggrement?.paymentAggrement == '2' ? JSON.stringify(terms) : undefined
      })
        .unwrap()
        .then(res => {
          triggerToast(res, { variant: ToastVariants.SUCCESS })
          setPaymentAggrement(undefined)
          setTerms([])
          onClose(true)
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    } else {
      alert('no segment id')
    }
  }

  const shouldDisableSubmitButton = () => {
    return !paymentAggrement || (paymentAggrement.paymentAggrement === '2' && terms.length === 0)
  }

  const bulidDefaultTerms = (value: number) => {
    setPaymentAggrement(prev => ({ ...prev, no_of_terms: value }))
    const date = new Date()
    const monthsToAddPerTerm = Math.floor(12 / value)

    setTerms(
      [...Array(value)].map((_, index) => ({
        payable_fees: (consolidatedFees.totalFees - consolidatedFees.totalDiscount) / value,
        due_date: new Date(date.getFullYear(), date.getMonth() + index * monthsToAddPerTerm, 10)
      }))
    )
  }

  const handlePaymentAggrementChange =
    (prop: keyof StudentPayableFeesRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setPaymentAggrement({ ...paymentAggrement, [prop]: event.target.value })
      setTerms([])
    }

  const handleDateChange = (date: Date | null, index?: number) => {
    if (date === null || index === undefined) return
    setTerms(terms.map((each, cindex) => (cindex === index ? { ...each, due_date: date } : each)))
  }

  const handleModalClose = () => {
    setPaymentAggrement(undefined)
    setTerms([])
    onClose(false)
  }

  return (
    <ChaarvyModal
      title='Fees Details Finalization'
      isOpen={isOpen}
      onClose={handleModalClose}
      modalSize='col-12 col-md-8'
    >
      <>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Particular</TableCell>
                <TableCell>Actual Fees</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Payable</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map(
                each =>
                  each.totalFees > 0 && (
                    <TableRow
                      key={each.particular}
                      hover
                      sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                    >
                      <TableCell></TableCell>
                      <TableCell>{each.particular}</TableCell>
                      <TableCell width='200px'>{each.totalFees}</TableCell>
                      <TableCell>{each.discount}</TableCell>
                      <TableCell>{each.totalFees - each.discount}</TableCell>
                    </TableRow>
                  )
              )}
              <TableRow hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                <TableCell></TableCell>
                <TableCell>Consolidated</TableCell>
                <TableCell width='200px'>{consolidatedFees.totalFees}</TableCell>
                <TableCell>{consolidatedFees.totalDiscount}</TableCell>
                <TableCell>{consolidatedFees.totalFees - consolidatedFees.totalDiscount}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box className='col-12 p-3'>
          <Grid container spacing={7}>
            <Grid item xs={12} md={6}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <FormControl fullWidth>
                  <small>Payment Aggrement</small>
                  <Select onChange={handlePaymentAggrementChange('paymentAggrement')}>
                    {isLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      (paymentAggrements ?? []).map(({ payment_aggrement_id, payment_aggrement_name }) => (
                        <MenuItem key={payment_aggrement_id} value={payment_aggrement_id}>
                          {payment_aggrement_name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {paymentAggrement?.paymentAggrement == '2' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <small>Number of term installments</small>
                  <Select onChange={e => bulidDefaultTerms(e.target.value as number)}>
                    {[...Array(12).keys()].map(each => (
                      <MenuItem key={each} value={each + 1}>
                        {each + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Box>

        {terms.length > 0 && (
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {terms.map((each, index) => (
                  <TableRow key={index} hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{each.payable_fees}</TableCell>
                    <TableCell>
                      <Box display='flex' flexDirection='column'>
                        <DatePicker
                          selected={each.due_date}
                          customInput={<CustomDateElement label='' />}
                          onChange={(date: Date | null) => handleDateChange(date, index)}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display='flex' justifyContent='space-around' mt={5}>
          <Button variant='outlined' color='error' onClick={handleModalClose}>
            Close
          </Button>
          <LoadingButton
            disabled={shouldDisableSubmitButton()}
            loading={isLoading}
            onClick={handleSubmit}
            variant='contained'
          >
            Submit
          </LoadingButton>
        </Box>
      </>
    </ChaarvyModal>
  )
}

export default PaymentFinaliseModal
