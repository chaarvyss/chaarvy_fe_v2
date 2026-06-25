import { LoadingButton } from '@mui/lab'
import { useMemo } from 'react'

import { FieldConfig, getMandatoryFieldsList, mapToFields, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'

type AddExpenseRequest = {
  expense_id?: string
  benficery_type_id: string
  category_id: string
  description: string
  amount: string
  expense_date: string
  expense_by: string
  benficery: string
  payment_mode: string
  reference_id: string
  remarks: string
}

const AddExpense = () => {
  const benficerTypes: any[] = [{ benName: 'test-ben', benType: 't-ben' }]
  const expenseCategoies = [{ label: 'test', value: 'tset' }]
  const paymentModes = [{ label: 'test', value: 1 }]

  const expenseFormConfig: FieldConfig<AddExpenseRequest>[] = useMemo(
    () => [
      { key: 'description', label: 'Description', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'expense_date', label: 'Date', type: InputTypes.DATE, rules: ['required'] },
      { key: 'expense_by', label: 'Paid by', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'benficery', label: 'Payee', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'reference_id', label: 'Reference id', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'remarks', label: 'Notes', type: InputTypes.INPUT, rules: ['required'] },
      {
        key: 'benficery_type_id',
        label: 'Benficery type',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: benficerTypes,
        onAddNew: async (text?: string) => {
          if (!text) return
          console.log('adding new beneficiary type:', text)

          // TODO: save `text` to your backend and refresh optionsMap
        },
        addNewLabel: 'Add new beneficiary',
        searchable: true,
        canEdit: true,
        onEdit: (a, b) => console.log(a, b),
        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.benName,
            value: s.benType
          })) ?? []
      },

      {
        key: 'category_id',
        label: 'Expense Category',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: expenseCategoies,
        onAddNew: async (text?: string) => {
          if (!text) return
          console.log('adding new beneficiary type:', text)

          // TODO: save `text` to your backend and refresh optionsMap
        },
        addNewLabel: 'Add new beneficiary',
        searchable: true

        // mapOptions: (data: any[]) =>
        //   data?.map(s => ({
        //     label: s.state_name,
        //     value: s.state_id
        //   })) ?? []
      },

      {
        key: 'payment_mode',
        label: 'Payment mode',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: paymentModes,

        onAddNew: async (text?: string) => {
          if (!text) return
          console.log('adding new beneficiary type:', text)

          // TODO: save `text` to your backend and refresh optionsMap
        },
        addNewLabel: 'Add new payment type'

        // mapOptions: (data: any[]) =>
        //   data?.map(s => ({
        //     label: s.state_name,
        //     value: s.state_id
        //   })) ?? []
      },

      {
        key: 'amount',
        label: 'Amount',
        type: InputTypes.INPUT,
        rules: ['required']
      }
    ],
    []
  )

  const { values, errors, handleChange, handleSubmit, optionsMap, loadingMap } = useFormBuilder<AddExpenseRequest>({
    fields: expenseFormConfig,
    initialValues: {
      expense_id: '',
      benficery_type_id: '',
      category_id: '',
      description: '',
      amount: '',
      expense_date: '',
      expense_by: '',
      benficery: '',
      payment_mode: '',
      reference_id: '',
      remarks: ''
    }
  })

  const fields = mapToFields({
    config: expenseFormConfig,
    values,
    handleChange,
    optionsMap,
    loadingMap
  })

  const onSubmit = (data: AddExpenseRequest) => {
    console.log(data)
  }

  return (
    <>
      <FormGenerator
        fields={fields}
        errors={errors}
        mandatoryFields={getMandatoryFieldsList(expenseFormConfig)}
        isLoading={false}

        // columnSize={{ xs: 12 }}
      />
      <LoadingButton
        onClick={handleSubmit(onSubmit)}
        variant='contained'
        color='primary'
        sx={{ mt: 2 }}
        loading={false}
      >
        Submit
      </LoadingButton>
    </>
  )
}

export default AddExpense
