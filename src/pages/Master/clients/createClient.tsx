import { Button, SelectChangeEvent } from '@mui/material'
import { Box, Grid, TextField } from '@muiElements'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
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
  const [errors, setErrors] = useState<Array<String>>([])

  const { closeDrawer } = useSideDrawer()

  const [handleCreateClient] = useCreateClientMutation()

  const { triggerToast } = useToast()
  const [clientData, setClientData] = useState<ClientData>(defaultClientData)

  const handleChange =
    (prop: keyof ClientData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) =>
      setClientData(prev => ({ ...prev, [prop]: event?.target?.value ?? event }))

  useEffect(() => {
    if (clientDetails) setClientData(clientDetails)
  }, [])

  const handleSubmit = () => {
    const errors: string[] = []

    baseProfileKeys.forEach(({ v: key }) => {
      const value = clientData[key as keyof ClientData]

      if (value === undefined || value === null || value === '' || value === 0) {
        errors.push(key)
        return
      }

      if (key.toLowerCase().includes('email_id')) {
        if (!isValidEmail(value as string)) {
          errors.push(key)
        }
      }

      if (key.toLowerCase().includes('contact_numbers')) {
        if (!isValidPhone(value as string)) {
          errors.push(key)
        }
      }
    })

    if (errors.length > 0) {
      setErrors(errors)
      console.log('Validation Errors:', errors)
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

  return (
    <Box>
      <Grid container spacing={7}>
        {baseProfileKeys.map(field => (
          <Grid item xs={12} key={field.v}>
            <Box display='flex' flexDirection='column'>
              <small>{field.l.replace('_', ' ').toUpperCase()}</small>
              <TextField
                error={errors.includes(field.v as keyof ClientData)}
                onChange={handleChange(field.v as keyof ClientData)}
                value={clientData?.[field.v as keyof ClientData]}
                size='small'
                disabled={['db_name'].includes(field.v) && !!clientDetails}
                type={
                  ['contact_numbers', 'processing_fees'].includes(field.v) ? InputVariants.NUMBER : InputVariants.TEXT
                }
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
          <Button variant='contained' onClick={handleSubmit}>
            {clientDetails ? 'Update' : 'Add'} Client
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CreateClient
