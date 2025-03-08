import {
  Card,
  IconButton,
  Paper,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import RenderFilterOptions from 'src/common/filters'
import { FilterProps, StudentPayment, TableHeaderStatCardProps } from 'src/lib/interfaces'
import ChaarvyPagination from 'src/reusable_components/Pagination'
import TableTilteHeader, { TableTitleHeaderProps } from 'src/reusable_components/TableTilteHeader'
import { useLazyGetPaymentRecieptByPaymentIdQuery } from 'src/store/services/feesServices'
import { useLazyGetPaymentsListQuery } from 'src/store/services/listServices'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons from 'src/utils/icons'
import { Box } from 'src/utils/muiElements'

const Payments = () => {
  const { triggerToast } = useToast()
  const { openDrawer } = useSideDrawer()

  const [fetchPaymentsList, { data: PaymentsList }] = useLazyGetPaymentsListQuery()
  const [fetchPaymentReciept] = useLazyGetPaymentRecieptByPaymentIdQuery()
  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })

  const onSubmit = (params?: FilterProps) => {
    fetchPaymentsList(params)
  }

  const handleRecieptDownload = (payment: StudentPayment) => {
    fetchPaymentReciept(payment.payment_id)
      .unwrap()
      .then(pdfBlob => {
        if (!pdfBlob) return

        const url = window.URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${payment.student_name}-fees-acknowledgement.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(e => {
        console.log(e)
      })
  }

  const onFilterButtonClick = () => {
    openDrawer('Filters', <RenderFilterOptions onSubmit={onSubmit} fields={['search', 'dateRange']} />)
  }

  useEffect(() => {
    fetchPaymentsList(filterProps)
      .unwrap()
      .catch(e => {
        triggerToast(e.data.detail, { variant: ToastVariants.ERROR })
      })
  }, [filterProps])

  const Payments = PaymentsList?.payments || []

  const paymentStats: TableHeaderStatCardProps[] = [
    {
      value: PaymentsList?.counts?.total ?? 0,
      title: 'Total Transactions',
      color: ThemeColorEnum.Primary,
      icon: <GetChaarvyIcons iconName='Transfer' fontSize={ChaarvyIconFontSize.lg} />
    },
    {
      value: PaymentsList?.counts?.filtered ?? 0,
      title: 'Filtered Count',
      color: ThemeColorEnum.Warning,
      icon: <GetChaarvyIcons iconName='Abacus' fontSize={ChaarvyIconFontSize.lg} />
    },
    {
      value: PaymentsList?.counts?.amount ?? 0,
      color: ThemeColorEnum.Success,
      title: 'Amount Collected',
      icon: <GetChaarvyIcons iconName='CurrencyRupee' fontSize={ChaarvyIconFontSize.lg} />
    }
  ]

  const getUserTableHeader = () => {
    const props: TableTitleHeaderProps = {
      title: 'Payments',
      stats: paymentStats,
      showFilterIcon: true,
      handleFilterButtonClick: onFilterButtonClick
    }
    return props
  }

  return (
    <>
      {TableTilteHeader(getUserTableHeader())}
      <Paper>
        <Card>
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>S#</TableCell>
                  <TableCell>Admission number</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Transaction Number</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Payments.map((payment, index) => (
                  <TableRow
                    hover
                    key={payment?.payment_id}
                    sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                  >
                    <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                      {index + 1 + (filterProps?.offset ?? 0)}
                    </TableCell>
                    <TableCell>{payment.admission_number}</TableCell>
                    <TableCell>{payment.student_name}</TableCell>
                    <TableCell>{payment.transaction_number}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.created_date}</TableCell>
                    <TableCell>
                      <Tooltip title='Fees Reciept' placement='top'>
                        <IconButton onClick={() => handleRecieptDownload(payment)}>
                          <GetChaarvyIcons iconName='Download' fontSize='1.25rem' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {Payments.length == 0 && (
              <Box justifyContent='center' alignItems='center' paddingBottom='2rem'>
                <Typography variant='h6' textAlign='center'>
                  No Payments Available
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Card>
        <ChaarvyPagination
          total={PaymentsList?.counts?.filtered ?? 0}
          onChange={data => setFilterProps({ ...filterProps, ...data })}
        />
      </Paper>
    </>
  )
}

export default Payments
