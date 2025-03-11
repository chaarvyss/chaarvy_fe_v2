import { LoadingButton } from '@mui/lab'
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@muiElements'
import React from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { StudentProgramFeesDetailsResponse, useCreateStudentPayableFeesMutation } from 'src/store/services/feesServices'
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
        segment_id
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

  return (
    <ChaarvyModal
      title='Fees Details Finalization'
      isOpen={isOpen}
      onClose={() => onClose(false)}
      modalSize='col-12 col-md-8'
    >
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
        <Box display='flex' justifyContent='space-around' mt={5}>
          <Button variant='outlined' color='error' onClick={() => onClose(false)}>
            Close
          </Button>
          <LoadingButton loading={isLoading} onClick={handleSubmit} variant='contained'>
            Submit
          </LoadingButton>
        </Box>
      </TableContainer>
    </ChaarvyModal>
  )
}

export default PaymentFinaliseModal
