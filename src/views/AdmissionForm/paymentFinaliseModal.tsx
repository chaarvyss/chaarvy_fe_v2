import { LoadingButton } from '@mui/lab'
import { CircularProgress, Grid, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
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
import React, { ChangeEvent, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import {
  StudentPayableFeesRequest,
  StudentProgramFeesDetailsResponse,
  useCreateStudentPayableFeesMutation
} from 'src/store/services/feesServices'
import { useGetPaymentAggrementsQuery } from 'src/store/services/listServices'
import { GetSumOfNumbers } from 'src/utils/helpers'

interface Props {
  feesDetails?: StudentProgramFeesDetailsResponse
  finalizedFeesDetails: boolean
  isOpen: boolean
  onClose: (isSuccess?: boolean) => void
  application_id?: string
  segment_id?: string
}

const PaymentFinaliseModal = ({ feesDetails, isOpen, onClose, application_id, segment_id }: Props) => {
  const [createStudentPayableFees, { isLoading }] = useCreateStudentPayableFeesMutation()
  const { triggerToast } = useToast()

  const { data: paymentAggrements } = useGetPaymentAggrementsQuery()

  const [paymentAggrement, setPaymentAggrement] = useState<StudentPayableFeesRequest>()

  let fees = [
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

  let consolidatedFees = fees.reduce(
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
        ...paymentAggrement
      })
        .unwrap()
        .then(res => {
          triggerToast(res, { variant: ToastVariants.SUCCESS })
          onClose(true)
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    } else {
      alert('no segment id')
    }
  }

  const handlePaymentAggrementChange =
    (prop: keyof StudentPayableFeesRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setPaymentAggrement({ ...paymentAggrement, [prop]: event.target.value })
    }

  const getPaymentAggrementDescription = () => {
    if (paymentAggrements && paymentAggrement?.paymentAggrement) {
      return paymentAggrements.find(each => each.payment_aggrement_id === paymentAggrement?.paymentAggrement)
        ?.description
    } else {
      return 'Please Select A payment aggrement option to proceed.'
    }
  }

  return (
    <ChaarvyModal
      title='Fees Details Finalization'
      isOpen={isOpen}
      onClose={() => onClose(false)}
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
                (each, index) =>
                  each.totalFees > 0 && (
                    <TableRow hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography>{getPaymentAggrementDescription()}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box display='flex' justifyContent='space-around' mt={5}>
          <Button variant='outlined' color='error' onClick={() => onClose(false)}>
            Close
          </Button>
          <LoadingButton loading={isLoading} onClick={handleSubmit} variant='contained'>
            Submit
          </LoadingButton>
        </Box>
      </>
    </ChaarvyModal>
  )
}

export default PaymentFinaliseModal
