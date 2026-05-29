import { LoadingButton } from '@mui/lab'
import { Button, CircularProgress, MenuItem, Select, Table } from '@mui/material'
import { Box, FormControl, Grid, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@muiElements'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import { useGetPaymentAggrementsQuery } from 'src/store/services/listServices'

type FinalizeFeesModalProps = {
  stats: {
    actual: number
    payable: number
    discount: number
    discountPercent: string
  }
  fees: FeesState
}

const FinalizeFeesModal = ({ stats, fees }: FinalizeFeesModalProps) => {
  const isLoading = false
  const { data: paymentAggrements } = useGetPaymentAggrementsQuery()

  const [paymentAggrement, setPaymentAggrement] = useState({})
  const [terms, setTerms] = useState<any[]>([])

  const bulidDefaultTerms = (value: number) => {
    setPaymentAggrement(prev => ({ ...prev, no_of_terms: value }))
    const date = new Date()
    const monthsToAddPerTerm = Math.floor(12 / value)

    setTerms(
      [...Array(value)].map((_, index) => {
        const dueDate = new Date(date.getFullYear(), date.getMonth() + index * monthsToAddPerTerm, date.getDate())

        dueDate.setDate(dueDate.getDate() + 2)

        return {
          payable_fees: (stats.actual - stats.discount) / value,
          due_date: dueDate
        }
      })
    )
  }

  const handlePaymentAggrementChange = v => {
    setPaymentAggrement(v)
    if (v !== '2') {
      setTerms([])
    }
  }

  const handleDateChange = (date: Date | null, index?: number) => {
    if (date === null || index === undefined) return
    setTerms(terms.map((each, cindex) => (cindex === index ? { ...each, due_date: date } : each)))
  }

  return (
    <ChaarvyModal modalSize='col-12 col-md-8' title='Finalize Fees details' isOpen={true} onClose={() => {}}>
      <>
        <Box className='col-12 p-3'>
          <Grid container spacing={7}>
            <Grid item xs={12} md={6}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <FormControl fullWidth>
                  <small>Payment Aggrement</small>
                  <Select onChange={e => handlePaymentAggrementChange(e.target.value)}>
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

            {paymentAggrement == '2' && (
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
          <Button variant='outlined' color='error' onClick={() => {}}>
            Close
          </Button>
          <LoadingButton disabled={false} loading={false} onClick={() => {}} variant='contained'>
            Submit
          </LoadingButton>
        </Box>
      </>
    </ChaarvyModal>
  )
}

export default FinalizeFeesModal
