import { LoadingButton } from '@mui/lab'
import { Grid, IconButton, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'

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
import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { InputTypes, InputVariants } from 'src/lib/enums'
import { TableHeaders } from 'src/lib/interfaces'
import { ErrorObject, InputFields } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import {
  PaymentDetailRequest,
  StudentPendingFeesDetails,
  useLazyGetPaymentRecieptByPaymentIdQuery,
  useLazyGetStudentPendingFeesDetailsQuery,
  useRecordPaymentTransactionMutation
} from 'src/store/services/feesServices'
import { useGetPaymentModesListQuery } from 'src/store/services/listServices'
import { printDocument } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'
import 'react-datepicker/dist/react-datepicker.css'

const TOP_LEVEL_ID = 'collect-payment'

const headers: TableHeaders[] = [
  { label: 's#' },
  { label: 'Segment Name' },
  { label: 'Payable fees' },
  { label: 'Paid Fees' },
  { label: 'Due Date' },
  { label: 'Due' },
  { label: 'Actions', width: '10px' }
]

const CollectPayment = () => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailRequest>()
  const [searchText, setSearchText] = useState<string>()
  const [isCollectPaymentModalOpen, setIsCollectPaymentModalOpen] = useState<boolean>(false)

  const [paymentDate, setPaymentDate] = useState<Date>()
  const { setLoading } = useLoader()

  const { triggerToast } = useToast()
  const [errors, setErrors] = useState<ErrorObject[]>([])
  const [fetchStudentPendingFees, { data: response, isLoading: fetchingRecords }] =
    useLazyGetStudentPendingFeesDetailsQuery()
  const { data: paymentModes } = useGetPaymentModesListQuery()
  const [recordTransaction, { isLoading }] = useRecordPaymentTransactionMutation()
  const [fetchPaymentReciept, { isLoading: fetchingReciept }] = useLazyGetPaymentRecieptByPaymentIdQuery()

  const [mandatoryFields, setMandatoryFields] = useState<Array<string>>([
    'segment_id',
    'application_id',
    'amount',
    'payment_mode',
    'payment_date'
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

  useEffect(() => {
    if (globalThis.window) {
      const queryParams = new URLSearchParams(globalThis.window.location.search)
      const id = queryParams?.get('id')
      if (id) {
        fetchStudentPendingFees(id)
          .unwrap()
          .catch(e => {
            triggerToast(e.data, { variants: ToastVariants.ERROR })
          })
      }
    }
  }, [])

  const uniqueSegments = Array.from(
    new Map(
      response?.fees_details.map(({ segment_id, segment_name }) => [segment_id, { segment_id, segment_name }])
    ).values()
  )

  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  const handleSetMandatoryFields = (isCash: boolean) => {
    setMandatoryFields(prev =>
      isCash ? prev.filter(item => item !== 'transaction_number') : [...new Set([...prev, 'transaction_number'])]
    )
  }

  const handlePaymentDetailChange =
    (prop: keyof PaymentDetailRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = typeof event === 'object' && 'target' in event ? event.target.value : event

      if (prop === 'payment_mode') {
        const isCash = value === '1'

        setPaymentDetails(prev => ({
          ...prev,
          payment_mode: value,
          ...(isCash && { transaction_number: undefined })
        }))

        handleSetMandatoryFields(isCash)

        return
      }
      setPaymentDetails(prev => ({
        ...prev,
        [prop]: value
      }))
    }

  const fields: InputFields[] = [
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__segment`,
      label: 'Segment',
      key: 'segment_id',
      value: paymentDetails?.segment_id,
      isDisabled: !!paymentDetails?.payment_id,
      onChange: handlePaymentDetailChange('segment_id'),
      menuOptions: (uniqueSegments ?? []).map(each => {
        return { value: each.segment_id, label: each.segment_name }
      })
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__amount`,
      label: 'Amount',
      isDisabled: !!paymentDetails?.payment_id,
      key: 'amount',
      value: paymentDetails?.amount,
      onChange: handlePaymentDetailChange('amount')
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
      type: InputTypes.DATE,
      id: `${TOP_LEVEL_ID}__paid-date`,
      label: 'Paid on',
      key: 'payment_date',
      value: paymentDate,
      customInput: <CustomDateElement error={!!getHadError('payment_date')} label='' />,
      onChange: (date: Date) => setPaymentDate(date)
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

  const renderField = (field: (typeof fields)[number]) => {
    const {
      type,
      id,
      label,
      placeholder,
      customInput,
      isDisabled,
      onChange,
      key,
      caption,
      value,
      variant,
      menuOptions
    } = field

    const error = getHadError(key)
    const isMandatory = mandatoryFields.includes(key)

    if (type === InputTypes.INPUT) {
      return (
        <>
          <small>
            {label} {isMandatory ? '*' : ''}
          </small>

          <TextField
            fullWidth
            id={id}
            value={value ?? ''}
            error={!!error}
            type={variant}
            disabled={isDisabled}
            placeholder={placeholder ?? ''}
            onChange={onChange}
          />

          {caption && <small>{caption}</small>}
          {error && <small style={{ color: 'red' }}>{error.error}</small>}
        </>
      )
    }

    if (type === InputTypes.SELECT) {
      return (
        <FormControl fullWidth error={!!error}>
          <small>
            {label} {isMandatory ? '*' : ''}
          </small>

          <Select id={id} value={value ?? ''} onChange={onChange} disabled={isDisabled}>
            {(menuOptions ?? []).map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>

          {error && <small style={{ color: 'red' }}>{error.error}</small>}
        </FormControl>
      )
    }

    if (type === InputTypes.DATE) {
      return (
        <Box width='100%'>
          <Box display='flex' flexDirection='column'>
            <small>Payment Date*</small>

            <DatePicker
              selected={paymentDate}
              required={isMandatory}
              customInput={customInput}
              id={id}
              onChange={onChange}
            />

            {error && <small style={{ color: 'red' }}>{error.error}</small>}
          </Box>
        </Box>
      )
    }

    return null
  }

  const renderInputFields = () =>
    fields.map(field => (
      <Grid item xs={12} sm={6} key={field.id} gap={3}>
        {renderField(field)}
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
      if (key == 'payment_date') {
        if (paymentDate == null) newErrors.push({ errorkey: 'payment_date', error: 'Required' })
      } else {
        const error = validateField(key, paymentDetails?.[key])
        if (error) newErrors.push(error)
      }
    })

    setErrors(newErrors)

    return newErrors.length === 0
  }

  const handleCollectClick = (feesDetail: StudentPendingFeesDetails) => {
    const preData = { segment_id: feesDetail.segment_id }
    if (feesDetail.payment_id) {
      preData['payment_id'] = feesDetail.payment_id
      preData['amount'] = feesDetail.payable
    }

    setIsCollectPaymentModalOpen(true)
    setPaymentDetails(prev => ({ ...prev, application_id: response?.application_id, ...preData }))
  }

  const handleCollectSubmit = () => {
    if (!validateForm()) {
      triggerToast('Please correct the errors before submitting.', { variant: ToastVariants.ERROR })

      return
    }
    paymentDetails &&
      recordTransaction({ ...paymentDetails, payment_date: paymentDate })
        .unwrap()
        .then(data => {
          triggerToast(data.Message, { variants: ToastVariants.SUCCESS })
          handleRecieptDownload(data.payment_id)
          setPaymentDetails(undefined)
          setPaymentDate(undefined)
          setIsCollectPaymentModalOpen(false)
        })
        .catch(e => triggerToast(e.data, { variants: ToastVariants.ERROR }))
  }

  const handleCollectPaymentModalClose = () => {
    setIsCollectPaymentModalOpen(false)
    setPaymentDetails(undefined)
    setPaymentDate(undefined)
    setErrors([])
  }

  const handleRecieptDownload = (payment_id: string) => {
    fetchPaymentReciept(payment_id)
      .unwrap()
      .then(pdfBlob => {
        if (!pdfBlob) return

        const url = globalThis.window.URL.createObjectURL(pdfBlob)
        printDocument(url)
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

  const showLoader = fetchingReciept || fetchingRecords

  setLoading(showLoader)

  const getDueDate = (feesDetail: StudentPendingFeesDetails) => {
    if ([null, 3].includes(feesDetail.payment_aggrement)) {
      return 'Flexible Payment'
    }

    return feesDetail.due_date
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
                  <TableCell
                    key={`collect-payment-header__${each.label}`}
                    style={each.width ? { width: each.width } : {}}
                  >
                    {each.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {response?.fees_details?.map((eachFees, index) => (
                <TableRow key={eachFees.payment_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{eachFees.segment_name}</TableCell>
                  <TableCell>{eachFees.payable}</TableCell>
                  <TableCell>{eachFees.paid}</TableCell>
                  <TableCell>{getDueDate(eachFees)}</TableCell>
                  <TableCell>{eachFees.payable - eachFees.paid}</TableCell>
                  <TableCell>
                    <Tooltip title='Collect Payment' placement='top'>
                      <IconButton onClick={() => handleCollectClick(eachFees)}>
                        <GetChaarvyIcons iconName='BankTransferIn' />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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
      {renderCollectPaymentModal()}
    </Card>
  )
}

export default CollectPayment
