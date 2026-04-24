import {
  Button,
  Card,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useLoader } from 'src/@core/context/loaderContext'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import RenderFilterOptions from 'src/common/filters'
import { FilterProps, StudentPayment, TableHeaderStatCardProps } from 'src/lib/interfaces'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyPagination from 'src/reusable_components/Pagination'
import TableTilteHeader, { TableTitleHeaderProps } from 'src/reusable_components/Table/TableTilteHeader'
import { useLazyGetPaymentRecieptByPaymentIdQuery } from 'src/store/services/feesServices'
import { useLazyGetPaymentsListQuery } from 'src/store/services/listServices'
import { useLazyGetPaymentDetailQuery } from 'src/store/services/viewServices'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import { printDocument } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'
import { Box } from 'src/utils/muiElements'

const Payments = () => {
  const { triggerToast } = useToast()
  const { openDrawer } = useSideDrawer()
  const { setLoading } = useLoader()

  const router = useRouter()

  const [fetchPaymentsList, { data: PaymentsList, isFetching: isFetchingPayments }] = useLazyGetPaymentsListQuery()
  const [fetchPaymentReciept, { isFetching: isFetchingPaymentReciept }] = useLazyGetPaymentRecieptByPaymentIdQuery()

  const [fetchPaymentDetail, { data: paymentDetailResponse, reset, isFetching: isFetchingPaymentDetail }] =
    useLazyGetPaymentDetailQuery()

  const [selectedPayment, setSelectedPayment] = useState<StudentPayment>()

  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0, status_: '1' })

  const onSubmit = (params?: FilterProps) => {
    fetchPaymentsList(params)
  }

  setLoading(isFetchingPaymentDetail || isFetchingPayments || isFetchingPaymentReciept)

  const handleRecieptDownload = (payment: StudentPayment) => {
    fetchPaymentReciept(payment.payment_id)
      .unwrap()
      .then(pdfBlob => {
        if (!pdfBlob) return
        const url = window.URL.createObjectURL(pdfBlob)
        printDocument(url)
      })
      .catch(e => {
        console.log(e)
      })
  }

  const statusOptions = [
    {
      label: 'Paid',
      value: '1'
    },
    {
      label: 'Unpaid',
      value: '0'
    }
  ]

  const onFilterButtonClick = () => {
    openDrawer({
      title: 'Filters',
      content: (
        <RenderFilterOptions
          onSubmit={onSubmit}
          fields={['search', 'dateRange', 'status']}
          statusOptions={statusOptions}
        />
      )
    })
  }

  useEffect(() => {
    if (selectedPayment) {
      fetchPaymentDetail(selectedPayment.payment_id)
    }
  }, [selectedPayment?.payment_id])

  useEffect(() => {
    fetchPaymentsList(filterProps)
      .unwrap()
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
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

  const handleModalClose = () => {
    setSelectedPayment(undefined)
    reset()
  }

  const PaymentDetail = () => {
    const {
      admission_number,
      amount,
      college_name,
      payment_mode,
      receipt_number,
      payment_datetime,
      student_name,
      father_name,
      campus_name,
      group,
      medium,
      transaction_id
    } = paymentDetailResponse ?? {}

    const items = [
      { label: 'Admission Number', value: admission_number },
      { label: 'Reciept Number', value: receipt_number },
      { label: 'Student Name', value: student_name },
      { label: 'Father Name', value: father_name },
      { label: 'College Name', value: college_name },
      { label: 'Campus Name', value: campus_name },
      { label: 'Group', value: group },
      { label: 'Medium', value: medium },
      { label: 'Payment Mode', value: payment_mode },
      { label: 'Payment Date', value: payment_datetime },
      { label: 'Transaction Number', value: transaction_id },
      { label: 'Amount', value: amount }
    ]

    if (selectedPayment == undefined) return

    return (
      <ChaarvyModal
        modalSize='col-12 col-md-10 col-xl-8'
        isOpen={true}
        onClose={handleModalClose}
        title='Payment Details'
      >
        <>
          <Grid container spacing={7}>
            {items.map(each => {
              return (
                <>
                  <Grid item xs={6} md={3}>
                    <Typography>{each.label}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography flexWrap='wrap'>: {each.value}</Typography>
                  </Grid>
                </>
              )
            })}
          </Grid>
          <Box display='flex' justifyContent='center' alignItems='center' marginTop='1rem' padding='1rem'>
            <Button onClick={() => handleRecieptDownload(selectedPayment)} variant='contained'>
              Print Reciept
            </Button>
          </Box>
        </>
      </ChaarvyModal>
    )
  }

  return (
    <>
      <PaymentDetail />
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
                  <TableCell>Status</TableCell>
                  <TableCell>Transaction Number</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Action</TableCell>
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
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{payment.transaction_number}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.created_date}</TableCell>
                    {payment.status == 1 ? (
                      <TableCell>
                        <Tooltip title='Fees Details' placement='top'>
                          <IconButton onClick={() => setSelectedPayment(payment)}>
                            <GetChaarvyIcons iconName='Eye' fontSize='1.25rem' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Fees Reciept' placement='top'>
                          <IconButton onClick={() => handleRecieptDownload(payment)}>
                            <GetChaarvyIcons iconName='Download' fontSize='1.25rem' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    ) : (
                      <TableCell>
                        <Tooltip title='Collect Payment' placement='top'>
                          <IconButton
                            onClick={() =>
                              router.push(`/StudentManagement/Payments/collectPayment/?id=${payment.admission_number}`)
                            }
                          >
                            <GetChaarvyIcons iconName='BankTransferIn' fontSize='1.75rem' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
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
