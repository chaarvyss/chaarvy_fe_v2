import {
  Card,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@muiElements'
import React, { useState, useEffect, ChangeEvent } from 'react'
import { ButtonColors } from 'src/lib/enums'
import TableTilteHeader, { TableTitleHeaderProps } from 'src/reusable_components/TableTilteHeader'
import {
  StudentProgramFeesDetailsResponse,
  useLazyGetStudentAdmissionFeesDetailsQuery,
  useLazyGetStudentPayableFeesDetailsQuery
} from 'src/store/services/feesServices'
import { ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons from 'src/utils/icons'
import PaymentFinaliseModal from './paymentFinaliseModal'
import { Checkbox, FormControlLabel } from '@mui/material'

interface FeesDetailsProps {
  application_id?: string
  segment_id?: string
}

const FeesDetails = ({ application_id, segment_id }: FeesDetailsProps) => {
  const [studentFees, setStudentFees] = useState<StudentProgramFeesDetailsResponse>()
  const [showFeesFinalizeModal, setShowFeesFinalizeModal] = useState(false)
  const [fetchStudentAdmissionFeesDetails] = useLazyGetStudentAdmissionFeesDetailsQuery()
  const [fetchStudentPayableFees, { data: finalizedFees, reset }] = useLazyGetStudentPayableFeesDetailsQuery()

  useEffect(() => {
    if (application_id && segment_id) fetchStudentPayableFees({ application_id, segment_id })
  }, [application_id, segment_id])

  useEffect(() => {
    if (finalizedFees) {
      setShowFeesFinalizeModal(true)
      setStudentFees(finalizedFees.fees_details)
    }
  }, [finalizedFees])

  useEffect(() => {
    application_id &&
      fetchStudentAdmissionFeesDetails(application_id).then(({ data: res }) => {
        setStudentFees(res)
      })
  }, [])

  const TotalFees = () => {
    const sum = (arr?: number[]) => arr?.reduce((acc, val) => acc + val, 0) || 0

    const totalFees = sum([
      ...(studentFees?.addonCourse.map(each => each.addon_coures_fees) || []),
      ...(studentFees?.prg_fees.map(each => each.fees) || []),
      ...(studentFees?.books.map(each => each.Total) || [])
    ])

    const discount = sum([
      ...(studentFees?.addonCourse.map(each => each.discount) || []),
      ...(studentFees?.prg_fees.map(each => each.discount) || [])
    ])

    return {
      actual: totalFees,
      discount,
      discount_percentage: totalFees ? (discount / totalFees) * 100 : 0,
      payable: totalFees - discount
    }
  }

  const getUserTableHeader = () => {
    const fees = TotalFees()

    return {
      title: 'Payment Details',
      stats: [
        {
          value: fees.actual,
          title: 'Total Payable',
          color: ThemeColorEnum.Warning,
          icon: <GetChaarvyIcons iconName='Cash' />
        },
        {
          value: `${fees.discount_percentage.toFixed(2)}%`,
          title: 'Discount',
          color: ThemeColorEnum.Info,
          icon: <GetChaarvyIcons iconName='Percent' />
        },
        {
          value: fees.discount,
          title: 'Consession Amount',
          color: ThemeColorEnum.Primary,
          icon: <GetChaarvyIcons iconName='Offer' />
        },
        {
          value: fees.payable,
          title: 'Net Payable',
          color: ThemeColorEnum.Success,
          icon: <GetChaarvyIcons iconName='CurrencyUsd' />
        }
      ],
      buttonTitle: 'Finalize',
      onButtonClick: () => setShowFeesFinalizeModal(true),
      buttonColor: ButtonColors.SUCCESS
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = event.target
    const [item, category] = id.split('--')
    reset()
    setStudentFees(prevFees => {
      if (!prevFees) return prevFees

      let updatedFees = { ...prevFees }

      if (category === 'prg_fees') {
        updatedFees.prg_fees = prevFees.prg_fees.map(eachItem =>
          eachItem.program_fees_id === item ? { ...eachItem, discount: Number(value) } : eachItem
        )
      }

      if (category === 'addonCourse') {
        updatedFees.addonCourse = prevFees.addonCourse.map(eachItem =>
          eachItem.program_addon_course_id === item ? { ...eachItem, discount: Number(value) } : eachItem
        )
      }

      if (category === 'books') {
        updatedFees.books = prevFees.books?.map(book =>
          book.program_book_id === item
            ? { ...book, isChecked: checked, Total: checked ? book.quantity * book.price : 0 }
            : book
        )
      }
      return updatedFees
    })
  }

  const handlePaymentFinaliseModalClose = () => {
    setShowFeesFinalizeModal(false)
  }

  return (
    <>
      <PaymentFinaliseModal
        application_id={application_id}
        segment_id={segment_id}
        feesDetails={studentFees}
        finalizedFeesDetails={!!finalizedFees}
        isOpen={showFeesFinalizeModal}
        onClose={handlePaymentFinaliseModalClose}
      />
      {TableTilteHeader(getUserTableHeader())}
      {studentFees && (
        <Paper>
          <Card sx={{ p: '1.5rem' }}>
            <Typography variant='h6' padding='1rem'>
              Base Fees
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
                <TableHead>
                  <TableRow>
                    <TableCell>S#</TableCell>
                    <TableCell>Fees Type</TableCell>
                    <TableCell>Actual Fees</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Payable</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(studentFees?.prg_fees).map((eachFees, index) => (
                    <TableRow
                      hover
                      key={eachFees.program_fees_id}
                      sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                    >
                      <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>{index + 1}</TableCell>
                      <TableCell width='300px'>{eachFees.fees_type}</TableCell>
                      <TableCell>{eachFees.fees}</TableCell>
                      <TableCell width='200px'>
                        <TextField
                          id={`${eachFees.program_fees_id}--prg_fees`}
                          onChange={handleChange}
                          size='small'
                          value={eachFees.discount}
                          type='number'
                        />
                      </TableCell>
                      <TableCell>{eachFees.fees - eachFees.discount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {studentFees.addonCourse.length > 0 && (
              <>
                <Typography variant='h6' padding='1rem'>
                  Addon Course Fees
                </Typography>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
                    <TableHead>
                      <TableRow>
                        <TableCell>S#</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Actual Fees</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>Payable</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentFees.addonCourse.map((eachFees, index) => (
                        <TableRow
                          hover
                          key={eachFees.student_addon_program_id}
                          sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                        >
                          <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>{index + 1}</TableCell>
                          <TableCell width='300px'>{eachFees.addon_course_name}</TableCell>
                          <TableCell>{eachFees.addon_coures_fees}</TableCell>
                          <TableCell width='200px'>
                            <TextField
                              id={`${eachFees.program_addon_course_id}--addonCourse`}
                              onChange={handleChange}
                              size='small'
                              value={eachFees.discount}
                              type='number'
                            />
                          </TableCell>
                          <TableCell>{eachFees.addon_coures_fees - eachFees.discount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {studentFees.books.length > 0 && (
              <>
                <Typography variant='h6' padding='1rem'>
                  Books Fees
                </Typography>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Book Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Payable</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentFees.books.map(eachBook => (
                        <TableRow
                          hover
                          key={eachBook.program_book_id}
                          sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                        >
                          <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  id={`${eachBook.program_book_id}--books`}
                                  onChange={handleChange}
                                  checked={eachBook.isChecked}
                                />
                              }
                              label=''
                            />
                          </TableCell>
                          <TableCell width='300px'>{eachBook.book_name}</TableCell>
                          <TableCell>{eachBook.quantity}</TableCell>
                          <TableCell>{eachBook.price}</TableCell>
                          <TableCell>{eachBook.Total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Card>
        </Paper>
      )}
    </>
  )
}

export default FeesDetails
