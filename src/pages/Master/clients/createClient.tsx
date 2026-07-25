import { LoadingButton } from '@mui/lab'
import { SelectChangeEvent } from '@mui/material'
import { ChangeEvent, useEffect, useState, useMemo } from 'react'

import { Box, Grid, TextField } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { useToast, ToastVariants } from 'src/@core/context/toastContext'
import { InputVariants } from 'src/lib/enums'
import { useCreateClientMutation } from 'src/store/services/MasterServices/adminServices'
import { isValidEmail, isValidPhone } from 'src/utils/helpers'

const baseProfileKeys = [
  { v: 'client_name', l: 'Client Name' },
  { v: 'db_name', l: 'DB Name' },
  { v: 'college_name', l: 'College Name' },
  { v: 'college_code', l: 'College Code' },
  { v: 'processing_fees', l: 'Processing Fees' },
  { v: 'contact_numbers', l: 'Contact number' },
  { v: 'email_id', l: 'Email' }
]

export interface ClientData {
  client_name: string
  db_name: string
  college_name: string
  college_code: string
  processing_fees: number
  contact_numbers: string
  email_id: string
}

const defaultClientData = {
  client_name: '',
  db_name: '',
  college_name: '',
  college_code: '',
  processing_fees: 0,
  contact_numbers: '',
  email_id: ''
}

const CreateClient = ({ clientDetails }: { clientDetails?: ClientData }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { closeDrawer } = useSideDrawer()

  const [handleCreateClient, { isLoading: isCreatingClient }] = useCreateClientMutation()

  const { triggerToast } = useToast()
  const [clientData, setClientData] = useState<ClientData>(defaultClientData)

  const handleChange =
    (prop: keyof ClientData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      let val = event?.target?.value ?? event

      // Auto-format the db_name as they type (optional but helpful)
      if (prop === 'db_name' && typeof val === 'string') {
        val = val.toUpperCase().replace(/\s/g, '')
      }

      setClientData(prev => ({ ...prev, [prop]: val as any }))

      // Clear the error for this specific field when the user types
      if (errors[prop]) {
        setErrors(prev => ({ ...prev, [prop]: '' }))
      }
    }

  useEffect(() => {
    setClientData(clientDetails ?? defaultClientData)
  }, [clientDetails])

  const hadErrors = useMemo(() => Object.values(errors).filter(error => error !== ''), [errors])

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {}

    baseProfileKeys.forEach(({ v: key, l: label }) => {
      const value = clientData[key as keyof ClientData]

      // Check for empty/default values
      if (value === undefined || value === null || value === '' || value === 0) {
        newErrors[key] = `${label} is required`

        return
      }

      if (key === 'email_id' && !isValidEmail(value as string)) {
        newErrors[key] = 'Please enter a valid email address'
      }

      if (key === 'contact_numbers' && !isValidPhone(value as string)) {
        newErrors[key] = 'Please enter a valid 10-digit phone number'
      }

      if (key === 'db_name') {
        const dbNameRegex = /^[TCS]\d+$/
        if (!dbNameRegex.test(value as string)) {
          newErrors[key] = 'Must start with T, C, or S followed only by numbers (e.g., T123)'
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)

      return
    }

    handleCreateClient({ ...clientData, contact_numbers: `${clientData.contact_numbers}` })
      .then(res => {
        setClientData(defaultClientData)
        closeDrawer()
        triggerToast(res.data as string, { variant: ToastVariants.SUCCESS })
      })
      .catch(e => triggerToast(e.data as string, { variant: ToastVariants.ERROR }))
  }

  console.log(errors, 'errors')

  return (
    <Box>
      <Grid container spacing={7}>
        {baseProfileKeys.map(field => (
          <Grid item xs={12} key={field.v}>
            <Box display='flex' flexDirection='column'>
              <small>{field.l.replace('_', ' ')}</small>
              <TextField
                error={!!errors[field.v as keyof ClientData]}
                onChange={handleChange(field.v as keyof ClientData)}
                value={clientData?.[field.v as keyof ClientData]}
                size='small'
                disabled={['db_name'].includes(field.v) && !!clientDetails}
                type={
                  ['contact_numbers', 'processing_fees'].includes(field.v) ? InputVariants.NUMBER : InputVariants.TEXT
                }
                helperText={errors[field.v]}
              />
              {field.v === 'contact_numbers' && (
                <p className='text-end' style={{ fontSize: '.7rem' }}>
                  {clientData.contact_numbers?.length ?? 0} chars
                </p>
              )}
            </Box>
          </Grid>
        ))}

        <Grid item>
          <LoadingButton
            loading={isCreatingClient}
            disabled={hadErrors.length > 0}
            variant='contained'
            onClick={handleSubmit}
          >
            {clientDetails ? 'Update' : 'Add'} Client
          </LoadingButton>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CreateClient
