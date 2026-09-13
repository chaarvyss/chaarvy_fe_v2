import { Box, TextField, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { ChaarvyButton } from 'src/reusable_components'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import { HolidayItem, useCreateUpdateHolidayMutation } from 'src/store/services/adminServices'

interface AddUpdateHolidayModalProps {
  isOpen: boolean
  onClose: () => void
  holidayToEdit?: HolidayItem | null
}

export const AddUpdateHolidayModal = ({ isOpen, onClose, holidayToEdit }: AddUpdateHolidayModalProps) => {
  const { triggerToast } = useToast()
  const [createUpdateHoliday, { isLoading }] = useCreateUpdateHolidayMutation()

  const [holidayName, setHolidayName] = useState('')
  const [holidayDate, setHolidayDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (holidayToEdit) {
      setHolidayName(holidayToEdit.holiday_name || '')
      setHolidayDate(holidayToEdit.date || dayjs().format('YYYY-MM-DD'))
    } else {
      setHolidayName('')
      setHolidayDate(dayjs().format('YYYY-MM-DD'))
    }
    setNameError('')
  }, [holidayToEdit, isOpen])

  const handleSubmit = async () => {
    if (!holidayName.trim()) {
      setNameError('Holiday name is required')

      return
    }

    if (!holidayDate) {
      triggerToast('Please select a date', { variant: ToastVariants.ERROR })

      return
    }

    try {
      const payload = {
        details: [
          {
            id: holidayToEdit?.id,
            holiday_name: holidayName.trim(),
            date: holidayDate
          }
        ]
      }

      const res = await createUpdateHoliday(payload).unwrap()
      triggerToast(res?.message || `Holiday ${holidayToEdit ? 'updated' : 'created'} successfully`, {
        variant: ToastVariants.SUCCESS
      })
      onClose()
    } catch (err: any) {
      triggerToast(err?.data?.message || err?.data || 'Failed to save holiday', {
        variant: ToastVariants.ERROR
      })
    }
  }

  const isFormValid = Boolean(holidayName.trim() && holidayDate)

  return (
    <ChaarvyModal
      isOpen={isOpen}
      id='add-update-holiday-modal'
      onClose={onClose}
      modalSize='col-11 col-sm-8 col-md-6 col-lg-4'
      title={holidayToEdit ? 'Edit Holiday' : 'Add New Holiday'}
      footer={
        <Box display='flex' justifyContent='flex-end' gap={1.5} width='100%' p={1}>
          <ChaarvyButton variant='outlined' color='secondary' onClick={onClose} size='small'>
            Cancel
          </ChaarvyButton>
          <ChaarvyButton
            variant='contained'
            color='primary'
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            onClick={handleSubmit}
            size='small'
            sx={{ px: 3 }}
          >
            {holidayToEdit ? 'Save Changes' : 'Add Holiday'}
          </ChaarvyButton>
        </Box>
      }
    >
      <Box display='flex' flexDirection='column' gap={3} p={2}>
        <Box>
          <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
            Holiday Name *
          </Typography>
          <TextField
            fullWidth
            size='small'
            placeholder='e.g. Independence Day, Diwali, Christmas'
            value={holidayName}
            onChange={e => {
              setHolidayName(e.target.value)
              if (e.target.value.trim()) setNameError('')
            }}
            error={Boolean(nameError)}
            helperText={nameError}
            autoFocus
          />
        </Box>

        <Box>
          <Typography variant='caption' color='text.secondary' fontWeight={600} mb={0.5} display='block'>
            Holiday Date *
          </Typography>

          <Box sx={{ '.react-datepicker-wrapper': { width: '100%' } }}>
            <DatePicker
              portalId='add-update-holiday-modal'
              selected={holidayDate ? new Date(holidayDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setHolidayDate(dayjs(date).format('YYYY-MM-DD'))
                }
              }}
              customInput={<CustomDateElement label='' />}
              popperContainer={({ children }) => <DatePickerWrapper>{children}</DatePickerWrapper>}
            />
          </Box>
          {holidayDate && (
            <Typography variant='caption' color='primary' mt={0.5} display='block'>
              {dayjs(holidayDate).format('dddd, MMMM D, YYYY')}
            </Typography>
          )}
        </Box>
      </Box>
    </ChaarvyModal>
  )
}

export default AddUpdateHolidayModal
