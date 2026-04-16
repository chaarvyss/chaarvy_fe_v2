import { SelectChangeEvent } from '@mui/material'
import { ChangeEvent, useState } from 'react'

import { Grid } from '@muiElements'
import AddressForm, { AddressType } from 'src/common/addressForm'
import FormRenderer from 'src/components/FormRenderer'
import { defaultValidateField } from 'src/components/FormRenderer/formValidator'
import { InputTypes, InputVariants } from 'src/lib/enums'
import { ErrorObject, InputFields } from 'src/lib/types'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'

const TOP_LEVEL_ID = 'vehicle-vendor'

const AddAndUpdateVehicleVendor = ({ address_id }) => {
  const [errors, setErrors] = useState<ErrorObject[]>([])
  const [vendorDetails, setVendorDetails] = useState({
    vendor_id: '',
    name: '',
    contactNumber: '',
    email: ''
  })

  const handleOnSave = () => {
    console.log('Saving vendor details:', { ...vendorDetails, address_id })
  }

  const handleInputChange =
    (prop: keyof typeof vendorDetails) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event
      const error = defaultValidateField({ key: prop, value })
      setErrors(error ? [...errors, error] : errors.filter(({ errorkey }) => errorkey !== prop))
      setVendorDetails({ ...vendorDetails, [prop]: event.target.value })
    }

  const fields: InputFields[] = [
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__name`,
      label: 'VendorName',
      key: 'name',
      value: vendorDetails?.name,
      onChange: handleInputChange('name')
    }
  ]

  return (
    <Grid container spacing={2}>
      <FormRenderer fields={fields} errors={errors} mandatoryFields={[]} />
      <ChaarvyButton
        onClick={handleOnSave}
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
