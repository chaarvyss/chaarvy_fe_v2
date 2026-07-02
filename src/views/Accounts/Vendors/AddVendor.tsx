import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import { useEffect, useMemo } from 'react'

import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { getMandatoryFieldsList, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'
import { useCreateUpdateVendorMutation, useGetVendorDetailQuery } from 'src/store/services/common/vendorServices'

interface AddVendorProps {
  vendorId?: string
}

const defaultFormValues = {
  vendor_name: '',
  vendor_firm_name: '',
  contact_number: '',
  email: ''
}

const AddVendor = ({ vendorId }: AddVendorProps) => {
  const { closeDrawer } = useSideDrawer()

  const { triggerToast } = useToast()

  const { data: vendorDetail, isFetching: isLoadingVendorDetail } = useGetVendorDetailQuery(vendorId ?? '', {
    skip: !vendorId
  })

  const [createUpdateVendor, { isLoading: isCreatingUpdatingVendor }] = useCreateUpdateVendorMutation()

  const vendorFormConfig: FieldConfig<AddVendorRequest>[] = useMemo(
    () => [
      { key: 'vendor_name', label: 'Vendor Name', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'vendor_firm_name', label: 'Vendor Firm Name', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'contact_number', label: 'Contact Number', type: InputTypes.INPUT, rules: ['required', 'mobile'] },
      { key: 'email', label: 'Email', type: InputTypes.INPUT, rules: ['required', 'email'] }
    ],
    []
  )

  const { errors, handleSubmit, fields, setValues, shouldDisableSubmit } = useFormBuilder<AddVendorRequest>({
    formConfig: vendorFormConfig,
    initialValues: defaultFormValues
  })

  const onSubmit = (data: AddVendorRequest) => {
    createUpdateVendor(data)
      .unwrap()
      .then(() => {
        triggerToast(`Vendor ${vendorId ? 'updated' : 'created'} successfully`, {
          variant: ToastVariants.SUCCESS
        })
        closeDrawer()
      })
      .catch(err => {
        triggerToast(err, {
          variant: ToastVariants.ERROR
        })
      })
  }

  useEffect(() => {
    if (vendorId) {
      if (vendorDetail) {
        setValues(vendorDetail)
      } else {
        setValues(defaultFormValues)
      }
    } else {
      setValues(defaultFormValues)
    }
  }, [vendorId, vendorDetail])

  const renderFooter = () => (
    <Stack direction='row' justifyContent='end'>
      <LoadingButton
        onClick={handleSubmit(onSubmit)}
        variant='contained'
        color='primary'
        size='small'
        disabled={shouldDisableSubmit}
        sx={{ mt: 5, textTransform: 'none' }}
        loading={isCreatingUpdatingVendor}
      >
        {vendorId ? 'Update' : 'Add'} vendor
      </LoadingButton>
    </Stack>
  )

  return (
    <FormGenerator
      fields={fields}
      errors={errors}
      mandatoryFields={getMandatoryFieldsList(vendorFormConfig)}
      isLoading={isLoadingVendorDetail}
      footer={renderFooter()}
      columnSize={{ sm: 12 }}
    />
  )
}

export default AddVendor
