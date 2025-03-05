import { CardContent, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React, { ChangeEvent, useState } from 'react'

import { Button, FormControl, Grid, InputLabel, TextField } from '@muiElements'

import { Address } from 'src/store/services/admisissionsService'
import { ErrorObject, InputFields } from 'src/lib/types'
import { InputTypes, InputVariants } from 'src/lib/enums'
import { useLazyGetDistrictsListQuery, useGetStateListQuery } from 'src/store/services/listServices'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'

interface AddressProps {
  application_id?: string
}

const TOP_LEVEL_ID = 'student-address'

const mandatoryFields = [
  'door_no',
  'house_apartment_name',
  'street',
  'landmark',
  'village_city',
  'district',
  'state',
  'pincode'
]

const StudentAddress = ({ application_id }: AddressProps) => {
  const [errors, setErrors] = useState<Array<ErrorObject>>([])
  const [studentAddress, setStudentAddress] = useState<Address>()
  const { triggerToast } = useToast()
  const { data: statesList } = useGetStateListQuery()
  const [fetchDistrictsList, { data: districtsList }] = useLazyGetDistrictsListQuery()

  const validateField = (key: keyof Address, value: any): { errorkey: string; error: string } | null => {
    if (!value) {
      return { errorkey: key, error: '* Required' }
    }

    switch (key) {
      case 'pincode':
        return /^[6-9]\d{5}$/.test(value) ? null : { errorkey: key, error: 'Invalid PINCODE number.' }
      default:
        return null
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ErrorObject[] = []

    mandatoryFields.forEach(field => {
      const key = field as keyof Address
      const error = validateField(key, studentAddress?.[key])
      if (error) newErrors.push(error)
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleAddressChange =
    (prop: keyof Address) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      if (prop == 'state') fetchDistrictsList(event.target.value)
      const value = event?.target?.value ?? event
      const error = validateField(prop, value)
      setErrors(error ? [...errors, error] : errors.filter(({ errorkey }) => errorkey !== prop))
      setStudentAddress({ ...studentAddress, [prop]: event.target.value })
    }

  const fields: InputFields[] = [
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__door-no`,
      label: 'Door No',
      key: 'door_no',
      value: studentAddress?.door_no,
      onChange: handleAddressChange('door_no')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__house-apartment-name`,
      label: 'House / Apartment name',
      key: 'house_apartment_name',
      value: studentAddress?.house_apartment_name,
      onChange: handleAddressChange('house_apartment_name')
    },

    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__street`,
      label: 'Street',
      key: 'street',
      value: studentAddress?.street,
      onChange: handleAddressChange('street')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__landmark`,
      label: 'Landmark',
      key: 'landmark',
      value: studentAddress?.landmark,
      onChange: handleAddressChange('landmark')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__village-city`,
      label: 'Village / city / town',
      key: 'village_city',
      value: studentAddress?.village_city,
      onChange: handleAddressChange('village_city')
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__state`,
      label: 'State',
      key: 'state',
      value: studentAddress?.state,
      onChange: handleAddressChange('state'),
      menuOptions: (statesList ?? []).map(each => {
        return { value: each.state_id, label: each.state_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__district`,
      label: 'District',
      key: 'district',
      value: studentAddress?.district,
      onChange: handleAddressChange('district'),
      menuOptions: (districtsList ?? []).map(each => {
        return { value: each.district_id, label: each.district_name }
      })
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__pin-code`,
      label: 'Pincode',
      key: 'pincode',
      value: studentAddress?.pincode,
      onChange: handleAddressChange('pincode')
    }
  ]

  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  const renderInputFields = () =>
    fields.map(({ type, id, label, placeholder, onChange, key, caption, value, variant, menuOptions }) => (
      <Grid item xs={12} sm={6} key={id}>
        {type === InputTypes.INPUT ? (
          <>
            <TextField
              required={mandatoryFields.includes(key)}
              fullWidth
              id={id}
              type={variant}
              error={!!getHadError(key)}
              label={label}
              value={value}
              placeholder={placeholder ?? ''}
              onChange={onChange}
            />
            {caption && <small>{caption}</small>}
            {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
          </>
        ) : type === InputTypes.SELECT ? (
          <FormControl fullWidth required={mandatoryFields.includes(key)}>
            <InputLabel>{label}</InputLabel>
            <Select label={label} id={id} value={value ?? ''} onChange={onChange} error={!!getHadError(key)}>
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

  const handleSubmit = () => {
    if (!validateForm()) {
      triggerToast('Please correct the errors before submitting.', { variant: ToastVariants.ERROR })
      return
    }
    alert('ready to create address')
    // if (applicationDetails) {
    //   if (admissionId) applicationDetails.application_id = admissionId
    //   createUpdateAdmission(applicationDetails)
    //     .unwrap()
    //     .then(res => {
    //       res.application_id && sessionStorage.setItem('admission_id', res.application_id)
    //       triggerToast(res.message ?? 'New application created', { variant: ToastVariants.SUCCESS })
    //     })
    //     .catch(res => triggerToast(res.data, { variant: ToastVariants.ERROR }))
    // }
  }

  return (
    <CardContent>
      <Grid container spacing={7}>
        {renderInputFields()}
        <Grid item xs={12}>
          <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmit}>
            Save Changes
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default StudentAddress
