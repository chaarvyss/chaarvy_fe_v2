import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import { useEffect } from 'react'

import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { getMandatoryFieldsList, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'
import { useCreateUpdateSubjectMutation } from 'src/store/services/adminServices'

type AddUpdateSubjectProps = {
  subject_id?: string
  subject_name?: string
}

const AddUpdateSubject = ({ subject_id, subject_name }: AddUpdateSubjectProps) => {
  const { closeDrawer } = useSideDrawer()
  const { triggerToast } = useToast()

  const [createUpdateSubject] = useCreateUpdateSubjectMutation()

  const subjectFormConfig: FieldConfig<Subject>[] = [
    { key: 'subject_name', label: 'Subject Name', type: InputTypes.INPUT, rules: ['required'] }
  ]

  const { fields, errors, handleSubmit, setValues } = useFormBuilder<Subject>({
    formConfig: subjectFormConfig,
    initialValues: {
      subject_name: ''
    }
  })

  useEffect(() => {
    if (subject_id && subject_name) {
      setValues({ subject_name, subject_id })
    }
  }, [subject_id, subject_name])

  const onSubmit = async (data: Subject) => {
    createUpdateSubject(data)
      .unwrap()
      .then(res => {
        triggerToast(res, {
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

  const renderFooter = () => {
    return (
      <Stack direction='row' spacing={2} justifyContent='flex-end'>
        <LoadingButton onClick={handleSubmit(onSubmit)}>Submit</LoadingButton>
      </Stack>
    )
  }

  return (
    <FormGenerator
      columnSize={{ xs: 12 }}
      fields={fields}
      errors={errors}
      mandatoryFields={getMandatoryFieldsList(subjectFormConfig)}
      isLoading={false}
      footer={renderFooter()}
    />
  )
}

export default AddUpdateSubject
