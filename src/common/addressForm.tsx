import { CardContent, CircularProgress, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { FormControl, Grid, TextField } from '@muiElements'

import { Address } from 'src/store/services/admisissionsService'
import { ErrorObject, InputFields } from 'src/lib/types'
import { InputTypes, InputVariants } from 'src/lib/enums'
import { useLazyGetDistrictsListQuery, useGetStateListQuery } from 'src/store/services/listServices'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useLoader } from 'src/@core/context/loaderContext'
import { LoadingButton } from '@mui/lab'
import { useCreateUpdateAddressMutation } from 'src/store/services/adminServices'

import { useGetAddressQuery } from 'src/store/services/viewServices'

export enum AddressType {
  COLLEGE = 'college',
  USER = 'user'
}

interface AddressProps {
  user_type: AddressType
  address_id?: string
  user_id?: string
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

const AddressForm = ({ address_id, user_id, user_type }: AddressProps) => {
  const [errors, setErrors] = useState<Array<ErrorObject>>([])
  const [AddressForm, setAddressForm] = useState<Address>()
  const { triggerToast } = useToast()
  const { setLoading } = useLoader()

  const { data: statesList } = useGetStateListQuery()
  const [fetchDistrictsList, { data: districtsList, isFetching: isDistrictsLoading }] = useLazyGetDistrictsListQuery()

  const [createUpdateAddress, { isLoading: isUpdatingAddress }] = useCreateUpdateAddressMutation()

  const { data: address, isFetching: isFetchingAddress } = useGetAddressQuery(address_id ?? '', { skip: !address_id })

  setLoading(isFetchingAddress)

  useEffect(() => {
    setAddressForm(address ?? undefined)
    if (address?.state) {
      fetchDistrictsList(address.state)
    }
  }, [address])

  const validateField = (key: keyof Address, value: any): { errorkey: string; error: string } | null => {
    if (!value) {
      return { errorkey: key, error: '* Required' }
    }

    switch (key) {
      case 'pincode':
        return /^[0-9]\d{5}$/.test(value) ? null : { errorkey: key, error: 'Invalid PINCODE number.' }
      default:
        return null
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ErrorObject[] = []

    mandatoryFields.forEach(field => {
      const key = field as keyof Address
      const error = validateField(key, AddressForm?.[key])
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
      setAddressForm({ ...AddressForm, [prop]: event.target.value })
    }

  const fields: InputFields[] = [
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__door-no`,
      label: 'Door No',
      key: 'door_no',
      value: AddressForm?.door_no,
      onChange: handleAddressChange('door_no')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__house-apartment-name`,
      label: 'House / Apartment name',
      key: 'house_apartment_name',
      value: AddressForm?.house_apartment_name,
      onChange: handleAddressChange('house_apartment_name')
    },

    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__street`,
      label: 'Street',
      key: 'street',
      value: AddressForm?.street,
      onChange: handleAddressChange('street')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__landmark`,
      label: 'Landmark',
      key: 'landmark',
      value: AddressForm?.landmark,
      onChange: handleAddressChange('landmark')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__village-city`,
      label: 'Village / city / town',
      key: 'village_city',
      value: AddressForm?.village_city,
      onChange: handleAddressChange('village_city')
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__state`,
      label: 'State',
      key: 'state',
      value: AddressForm?.state,
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
      isLoading: isDistrictsLoading,
      value: AddressForm?.district,
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
      value: AddressForm?.pincode,
      onChange: handleAddressChange('pincode')
    }
  ]

  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  const renderInputFields = () =>
    fields.map(({ type, id, label, placeholder, onChange, key, caption, isLoading, value, variant, menuOptions }) => (
      <Grid item xs={12} sm={6} key={id}>
        {type === InputTypes.INPUT ? (
          <>
            <small>
              {label} <span style={{ color: 'red' }}>{mandatoryFields.includes(key) ? '*' : ''}</span>
            </small>
            <TextField
              fullWidth
              id={id}
              type={variant}
              error={!!getHadError(key)}
              value={value}
              placeholder={placeholder ?? ''}
              onChange={onChange}
            />
            {caption && <small>{caption}</small>}
            {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
          </>
        ) : type === InputTypes.SELECT ? (
          <FormControl fullWidth required={mandatoryFields.includes(key)}>
            <small>
              {label} <span style={{ color: 'red' }}>{mandatoryFields.includes(key) ? '*' : ''}</span>
            </small>
            <Select id={id} value={value ?? ''} onChange={onChange} error={!!getHadError(key)}>
              {isLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : (
                (menuOptions ?? []).map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))
              )}
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
    if (AddressForm) {
      createUpdateAddress({ address: AddressForm, user_type: user_type, user_id: user_id })
        .unwrap()
        .then(res => {
          triggerToast(res, { variant: ToastVariants.SUCCESS })
        })
        .catch(res => triggerToast(res.data, { variant: ToastVariants.ERROR }))
    }
  }

  const disableSubmitButton = mandatoryFields.some(each => !AddressForm?.[each])

  return (
    <CardContent>
      <Grid container spacing={7}>
        {renderInputFields()}
        <Grid item xs={12}>
          <LoadingButton
            loading={isUpdatingAddress}
            disabled={disableSubmitButton || errors.length > 0}
            variant='contained'
            sx={{ marginRight: 3.5 }}
            onClick={handleSubmit}
          >
            Save Changes
          </LoadingButton>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default AddressForm
