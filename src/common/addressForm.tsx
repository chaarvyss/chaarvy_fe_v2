import { LoadingButton } from '@mui/lab'
import { useEffect, useMemo } from 'react'

import { Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { FieldConfig, getMandatoryFieldsList, mapToFields, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'
import { useCreateUpdateAddressMutation } from 'src/store/services/adminServices'
import { Address } from 'src/store/services/admisissionsService'
import { useGetStateListQuery, useLazyGetDistrictsListQuery } from 'src/store/services/listServices'
import { useGetAddressQuery } from 'src/store/services/viewServices'

export enum AddressType {
  COLLEGE = 'college',
  USER = 'user',
  STUDENT = 'student',
  VENDOR = 'vendor'
}

interface AddressProps {
  application_id?: string
  user_type: AddressType
  address_id?: string
  user_id?: string
  isLoading?: boolean
  handleNext?: () => void
}

const AddressForm = ({ application_id, address_id, user_id, user_type, isLoading, handleNext }: AddressProps) => {
  const { data: address, isFetching } = useGetAddressQuery(address_id ?? '', {
    skip: !address_id
  })

  const [createUpdateAddress, { isLoading: isSubmitting }] = useCreateUpdateAddressMutation()

  const { data: statesList } = useGetStateListQuery()
  const [fetchDistricts] = useLazyGetDistrictsListQuery()

  const { triggerToast } = useToast()

  const addressFormConfig: FieldConfig<Address>[] = useMemo(
    () => [
      { key: 'door_no', label: 'Door No', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'house_apartment_name', label: 'House / Apartment', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'street', label: 'Street', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'landmark', label: 'Landmark', type: InputTypes.INPUT },
      { key: 'village_city', label: 'Village / City', type: InputTypes.INPUT, rules: ['required'] },
      {
        key: 'state',
        label: 'State',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: statesList,

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.state_name,
            value: s.state_id
          })) ?? []
      },

      {
        key: 'district',
        label: 'District',
        type: InputTypes.SELECT,
        rules: ['required'],
        dependsOn: 'state',

        fetchOptions: async (stateId: string) => {
          const res = await fetchDistricts(stateId).unwrap()

          return res
        },

        mapOptions: (data: any[]) =>
          data?.map(d => ({
            label: d.district_name,
            value: d.district_id
          })) ?? []
      },

      {
        key: 'pincode',
        label: 'Pincode',
        type: InputTypes.INPUT,
        rules: [
          'required',
          'number',
          { type: 'maxLength', value: 6, message: 'Pincode cannot exceed 6 digits' },
          { type: 'minLength', value: 6, message: 'Pincode must be 6 digits' }
        ]
      }
    ],
    [statesList]
  )

  const { values, errors, handleChange, handleSubmit, optionsMap, loadingMap, setValues } = useFormBuilder<Address>({
    fields: addressFormConfig,
    initialValues: {
      door_no: '',
      house_apartment_name: '',
      street: '',
      landmark: '',
      village_city: '',
      state: '',
      district: '',
      pincode: ''
    }
  })

  useEffect(() => {
    if (address) {
      setValues(address)
    }
  }, [address])

  const fields = mapToFields({
    config: addressFormConfig,
    values,
    handleChange,
    optionsMap,
    loadingMap
  })

  const onSubmit = async (data: Address) => {
    const address_payload = { ...data, application_id, address_id }

    try {
      const res = await createUpdateAddress({
        address: address_payload,
        user_type,
        user_id
      }).unwrap()

      triggerToast(res, { variant: ToastVariants.SUCCESS })
      handleNext?.()
    } catch (err: any) {
      triggerToast(err?.data || 'Something went wrong', {
        variant: ToastVariants.ERROR
      })
    }
  }

  if (isLoading) return <Typography variant='body1'>Loading...</Typography>

  return (
    <>
      <FormGenerator
        fields={fields}
        errors={errors}
        mandatoryFields={getMandatoryFieldsList(addressFormConfig)}
        isLoading={isFetching}
      />
      <LoadingButton
        onClick={handleSubmit(onSubmit)}
        variant='contained'
        color='primary'
        sx={{ mt: 2 }}
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        Submit
      </LoadingButton>
    </>
  )
}

export default AddressForm
