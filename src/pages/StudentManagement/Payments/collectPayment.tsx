import { LoadingButton } from '@mui/lab'
import { Grid, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import {
  Box,
  Button,
  Card,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@muiElements'
import React, { ChangeEvent, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { InputTypes, InputVariants } from 'src/lib/enums'
import { TableHeaders } from 'src/lib/interfaces'
import { ErrorObject, InputFields } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import {
  PaymentDetailRequest,
  useLazyGetPaymentRecieptByPaymentIdQuery,
  useLazyGetStudentPendingFeesDetailsQuery,
  useRecordPaymentTransactionMutation
} from 'src/store/services/feesServices'
import { useGetPaymentModesListQuery } from 'src/store/services/listServices'
import GetChaarvyIcons from 'src/utils/icons'

const TOP_LEVEL_ID = 'collect-payment'

const headers: TableHeaders[] = [
  { label: 's#' },
  { label: 'Segment Name' },
  { label: 'Payable fees' },
  { label: 'Paid Fees' },
  { label: 'Due' }
]

const CollectPayment = () => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailRequest>()
  const [searchText, setSearchText] = useState<string>()
  const [isCollectPaymentModalOpen, setIsCollectPaymentModalOpen] = useState<boolean>(false)

  const { triggerToast } = useToast()
  const [errors, setErrors] = useState<ErrorObject[]>([])
  const [fetchStudentPendingFees, { data: response }] = useLazyGetStudentPendingFeesDetailsQuery()
  const { data: paymentModes } = useGetPaymentModesListQuery()
  const [recordTransaction, { isLoading }] = useRecordPaymentTransactionMutation()
  const [fetchPaymentReciept] = useLazyGetPaymentRecieptByPaymentIdQuery()

  const [mandatoryFields, setMandatoryFields] = useState<Array<string>>([
    'segment_id',
    'application_id',
    'amount',
    'payment_mode'
  ])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const handleSearch = e => {
    e.preventDefault()
    searchText &&
      fetchStudentPendingFees(searchText)
        .unwrap()
        .catch(e => {
          triggerToast(e.data, { variants: ToastVariants.ERROR })
        })
  }

  const uniqueSegments = Array.from(
    new Map(
      response?.fees_details.map(({ segment_id, segment_name }) => [segment_id, { segment_id, segment_name }])
    ).values()
  )

  const handlePaymentDetailChange =
    (prop: keyof PaymentDetailRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event

      if (prop == 'payment_mode') {
        if (value == '1') {
          setPaymentDetails(prev => ({ ...prev, transaction_number: undefined }))
          setMandatoryFields(prevItems => prevItems.filter(item => item !== 'transaction_number'))
        } else {
          setMandatoryFields([...mandatoryFields, 'transaction_number'])
        }
      }

      setPaymentDetails(prev => ({ ...prev, [prop]: value }))
    }

  const fields: InputFields[] = [
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__segment`,
      label: 'Segment',
      key: 'segment_id',
      value: paymentDetails?.segment_id,
      onChange: handlePaymentDetailChange('segment_id'),
      menuOptions: (uniqueSegments ?? []).map(each => {
        return { value: each.segment_id, label: each.segment_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__payment_mode`,
      label: 'Payment Mode',
      key: 'payment_mode',
      value: paymentDetails?.payment_mode,
      onChange: handlePaymentDetailChange('payment_mode'),
      menuOptions: (paymentModes ?? []).map(each => {
        return { value: each.payment_mode_id, label: each.payment_mode }
      })
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__amount`,
      label: 'Amount',
      key: 'amount',
      value: paymentDetails?.amount,
      onChange: handlePaymentDetailChange('amount')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__txn-id`,
      label: 'Transaction Id',
      isDisabled: paymentDetails?.payment_mode == '1',
      key: 'transaction_number',
      value: paymentDetails?.transaction_number,
      onChange: handlePaymentDetailChange('transaction_number')
    }
  ]

  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  const renderInputFields = () =>
    fields.map(({ type, id, label, placeholder, isDisabled, onChange, key, caption, value, variant, menuOptions }) => (
      <Grid item xs={12} sm={6} key={id} gap={3}>
        {type === InputTypes.INPUT ? (
          <>
            <small>
              {label} {mandatoryFields.includes(key) ? '*' : ''}
            </small>
            <TextField
              fullWidth
              id={id}
              value={value ?? ''}
              error={!!getHadError(key)}
              defaultValue={value}
              type={variant}
              disabled={isDisabled}
              placeholder={placeholder ?? ''}
              onChange={onChange}
            />
            {caption && <small>{caption}</small>}
            {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
          </>
        ) : type === InputTypes.SELECT ? (
          <FormControl fullWidth error={!!getHadError(key)}>
            <small>
              {label} {mandatoryFields.includes(key) ? '*' : ''}
            </small>
            <Select id={id} value={value ?? ''} onChange={onChange}>
              {(menuOptions ?? []).map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
          </FormControl>
        ) : null}
      </Grid>
    ))

  const validateField = (key: keyof PaymentDetailRequest, value: any): { errorkey: string; error: string } | null => {
    if (!value) {
      return { errorkey: key, error: '* Required' }
    }
    return null
  }

  const validateForm = (): boolean => {
    const newErrors: ErrorObject[] = []

    mandatoryFields.forEach(field => {
      const key = field as keyof PaymentDetailRequest
      const error = validateField(key, paymentDetails?.[key])
      if (error) newErrors.push(error)
    })

    setErrors(newErrors)

    console.log(newErrors, 'newErrors')
    return newErrors.length === 0
  }

  const handleCollectClick = () => {
    setIsCollectPaymentModalOpen(true)
    setPaymentDetails(prev => ({ ...prev, application_id: response?.application_id }))
  }

  const handleCollectSubmit = () => {
    console.log(paymentDetails, 'paymentDetails')
    if (!validateForm()) {
      triggerToast('Please correct the errors before submitting.', { variant: ToastVariants.ERROR })
      return
    }
    paymentDetails &&
      recordTransaction(paymentDetails)
        .unwrap()
        .then(data => {
          triggerToast(data.Message, { variants: ToastVariants.SUCCESS })
          handleRecieptDownload(data.payment_id)
          setPaymentDetails(undefined)
          setIsCollectPaymentModalOpen(false)
        })
        .catch(e => triggerToast(e.data, { variants: ToastVariants.ERROR }))
  }

  const handleCollectPaymentModalClose = () => {
    setIsCollectPaymentModalOpen(false)
    setPaymentDetails(undefined)
  }

  const handleRecieptDownload = (payment_id: string) => {
    fetchPaymentReciept(payment_id)
      .unwrap()
      .then(pdfBlob => {
        if (!pdfBlob) return

        const url = window.URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payment_receipt-${response?.student_name}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(e => {
        console.log(e)
      })
  }

  const renderCollectPaymentModal = () => {
    return (
      <ChaarvyModal
        isOpen={isCollectPaymentModalOpen}
        onClose={handleCollectPaymentModalClose}
        shouldRestrictCloseOnOuterClick
        shouldWarnOnClose
        title='Payment Details'
      >
        <Box gap={3}>
          {renderInputFields()}
          <Box margin={3} display='flex' justifyContent='space-around' alignItems='center'>
            <Button onClick={handleCollectPaymentModalClose} variant='outlined' color='error'>
              Cancel
            </Button>
            <LoadingButton loading={isLoading} onClick={handleCollectSubmit} variant='contained' color='success'>
              Submit
            </LoadingButton>
          </Box>
        </Box>
      </ChaarvyModal>
    )
  }

  return (
    <Card sx={{ p: 5 }}>
      <Typography variant='h6'>Payment Collection Portal</Typography>
      <Box
        marginTop='1rem'
        display='flex'
        justifyContent={response ? 'space-between' : 'end'}
        alignItems='end'
        gap={3}
        marginBottom='3rem'
      >
        {response && (
          <Box display='flex' flexDirection='column' gap={3}>
            <Typography>Student Name : {response?.student_name}</Typography>
            <Typography>Program : {response?.program}</Typography>
            <Typography>Admission Number : {response?.admission_id}</Typography>
          </Box>
        )}
        <form onSubmit={handleSearch}>
          <Box display='flex' justifyContent='end' alignItems='end' gap={3}>
            <FormControl>
              <small>Admission Number</small>
              <TextField onChange={handleChange} size='small' />
            </FormControl>
            <Button
              disabled={!searchText}
              onClick={handleSearch}
              startIcon={<GetChaarvyIcons iconName='Magnify' />}
              variant='contained'
            >
              Search
            </Button>
          </Box>
        </form>
      </Box>

      {response && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map(each => (
                  <TableCell style={each.width ? { width: each.width } : {}}>{each.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {response?.fees_details?.map((eachFees, index) => (
                <TableRow>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{eachFees.segment_name}</TableCell>
                  <TableCell>{eachFees.payable}</TableCell>
                  <TableCell>{eachFees.paid}</TableCell>
                  <TableCell>{eachFees.payable - eachFees.paid}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {response?.fees_details.length == 0 && (
            <Box display='flex' justifyContent='center' padding='2rem'>
              <Typography>No Fees Details Available. Please Update</Typography>
            </Box>
          )}
        </TableContainer>
      )}
      {response && response?.fees_details?.length > 0 && (
        <Box display='flex' justifyContent='center' alignItems='center' padding='1rem'>
          <LoadingButton variant='contained' onClick={handleCollectClick}>
            Collect Fees
          </LoadingButton>
        </Box>
      )}
      {renderCollectPaymentModal()}
    </Card>
  )
}

export default CollectPayment
