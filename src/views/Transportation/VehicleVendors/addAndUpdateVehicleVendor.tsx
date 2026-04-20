import { useMemo } from 'react'

import { Grid } from '@muiElements'
import AddressForm, { AddressType } from 'src/common/addressForm'
import { FieldConfig, getMandatoryFieldsList, mapToFields, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import FormGenerator from 'src/reusable_components/formGenerator'

interface VehicleVendorRequest {
  vendor_id?: string
  vendor_name: string
  contact_number?: number
  email: string
}

const AddAndUpdateVehicleVendor = ({ address_id }) => {
  const vendorVehicleConfig: FieldConfig<VehicleVendorRequest>[] = useMemo(
    () => [
      { key: 'vendor_name', label: 'Vehicle vendor name', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'contact_number', label: 'Contact number', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'email', label: 'Email', type: InputTypes.INPUT, rules: ['required', 'email'] }
    ],
    []
  )

  const { values, errors, handleChange, handleSubmit, optionsMap, loadingMap } = useFormBuilder<VehicleVendorRequest>({
    fields: vendorVehicleConfig,
    initialValues: {
      vendor_id: '',
      vendor_name: '',
      contact_number: undefined,
      email: ''
    }
  })

  const fields = mapToFields({
    config: vendorVehicleConfig,
    values,
    handleChange,
    optionsMap,
    loadingMap
  })

  const onSubmit = value => {
    console.log('Saving vendor details:', value)
  }

  // TODO: Need to fix this page
  //    1 create user
  //    2 update address

  return (
    <Grid container spacing={2}>
      <FormGenerator fields={fields} errors={errors} mandatoryFields={getMandatoryFieldsList(vendorVehicleConfig)} />
      <ChaarvyButton
        onClick={handleSubmit(onSubmit)}
        variant='contained'
        color='primary'
        sx={{ height: 'fit-content', alignSelf: 'center' }}
      >
        Save
      </ChaarvyButton>
      <AddressForm address_id={address_id} user_type={AddressType.VENDOR} user_id='to be added' />
    </Grid>
  )
}

export default AddAndUpdateVehicleVendor
