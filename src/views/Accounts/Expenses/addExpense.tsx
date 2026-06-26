import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import { useMemo } from 'react'

import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { FieldConfig, getMandatoryFieldsList, mapToFields, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'
import { useCreateUpdateExpenseMutation } from 'src/store/services/common/expenseServices'
import {
  useGetBenificeryTypesListQuery,
  useGetExpenseCategoryTypesListQuery
} from 'src/store/services/common/listServices'
import { useGetPaymentModesListQuery } from 'src/store/services/listServices'

const AddExpense = () => {
  const { closeDrawer } = useSideDrawer()

  const { triggerToast } = useToast()

  const { data: benficerTypes } = useGetBenificeryTypesListQuery()
  const { data: expenseCategoies } = useGetExpenseCategoryTypesListQuery()
  const { data: paymentModes } = useGetPaymentModesListQuery()

  const [addExpenseRecord] = useCreateUpdateExpenseMutation()

  const expenseFormConfig: FieldConfig<ExpenseRequest>[] = useMemo(
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
        isLoading: true,
        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.benficery_type_name,
            value: s.benficery_type_id
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
        addNewLabel: 'Add expense category',
        searchable: true,
        isLoading: true,
        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.category_name,
            value: s.category_id
          })) ?? []
      },

      {
        key: 'payment_mode',
        label: 'Payment mode',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: paymentModes,
        isLoading: true,
        onAddNew: async (text?: string) => {
          if (!text) return
          console.log('adding new beneficiary type:', text)

          // TODO: save `text` to your backend and refresh optionsMap
        },
        addNewLabel: 'Add new payment type',

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.payment_mode,
            value: s.payment_mode_id
          })) ?? []
      },

      {
        key: 'amount',
        label: 'Amount',
        type: InputTypes.INPUT,
        rules: ['required']
      }
    ],
    [paymentModes, benficerTypes, expenseCategoies]
  )

  const { values, errors, handleChange, handleSubmit, optionsMap, loadingMap } = useFormBuilder<ExpenseRequest>({
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

  const onSubmit = (data: ExpenseRequest) => {
    addExpenseRecord(data)
      .unwrap()
      .then(() => {
        triggerToast('Expense record added successfully', {
          variant: ToastVariants.SUCCESS
        })
        closeDrawer()
      })
      .catch(e =>
        triggerToast(e, {
          variant: ToastVariants.ERROR
        })
      )
  }

  return (
    <>
      <FormGenerator
        fields={fields}
        errors={errors}
        mandatoryFields={getMandatoryFieldsList(expenseFormConfig)}
        isLoading={false}
      />
      <Stack direction='row' justifyContent='end'>
        <LoadingButton
          onClick={handleSubmit(onSubmit)}
          variant='contained'
          color='primary'
          size='small'
          sx={{ mt: 5, textTransform: 'none' }}
          loading={false}
        >
          Add expense
        </LoadingButton>
      </Stack>
    </>
  )
}

export default AddExpense
