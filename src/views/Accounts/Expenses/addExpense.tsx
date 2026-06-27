import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import { useMemo } from 'react'

import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { FieldConfig, getMandatoryFieldsList, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'
import {
  useCreateUpdateBenficeryTypeMutation,
  useCreateUpdateExpenseCategoryTypeMutation,
  useCreateUpdateExpenseMutation,
  useCreateUpdatePaymentModeMutation
} from 'src/store/services/common/expenseServices'
import {
  useGetBenificeryTypesListQuery,
  useGetExpenseCategoryTypesListQuery
} from 'src/store/services/common/listServices'
import { useGetPaymentModesListQuery } from 'src/store/services/listServices'

const AddExpense = () => {
  const { closeDrawer } = useSideDrawer()

  const { triggerToast } = useToast()

  const { data: benficerTypes, isFetching: isFetchingBenficieryTypes } = useGetBenificeryTypesListQuery()
  const { data: expenseCategoies, isFetching: isFetchingExpenseCategories } = useGetExpenseCategoryTypesListQuery()
  const { data: paymentModes, isFetching: isFetchingPaymentModes } = useGetPaymentModesListQuery()

  const [createUpdateBenficeryType, { isLoading: isUpdatingBenficaryTypes }] = useCreateUpdateBenficeryTypeMutation()
  const [createUpdateExpenceCategoryType, { isLoading: isUpdatingExpenseCategories }] =
    useCreateUpdateExpenseCategoryTypeMutation()
  const [createUpdatePaymentMode, { isLoading: isUpdatingPaymentModes }] = useCreateUpdatePaymentModeMutation()

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
          createUpdateBenficeryType({
            benficery_type_name: text
          })
        },
        isOptionsLoading: isFetchingBenficieryTypes,
        addNewLabel: 'Add new beneficiary',
        searchable: true,
        isUpdating: isUpdatingBenficaryTypes,
        canEdit: true,
        onEdit: (id, value) => {
          createUpdateBenficeryType({
            benficery_type_id: String(id),
            benficery_type_name: value
          })
        },
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
          createUpdateExpenceCategoryType({
            category_name: text
          })
        },
        isOptionsLoading: isFetchingExpenseCategories,
        addNewLabel: 'Add expense category',
        searchable: true,
        isUpdating: isUpdatingExpenseCategories,
        onEdit: (id, value) => {
          createUpdateExpenceCategoryType({
            category_id: String(id),
            category_name: value
          })
        },
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
        searchable: true,
        isOptionsLoading: isFetchingPaymentModes,
        isUpdating: isUpdatingPaymentModes,
        onAddNew: async (text?: string) => {
          if (!text) return
          createUpdatePaymentMode({ payment_mode: text })
        },
        addNewLabel: 'Add new payment mode',
        onEdit: (id, value) => {
          createUpdatePaymentMode({ payment_mode_id: Number(id), payment_mode: value })
        },
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
    [
      paymentModes,
      benficerTypes,
      expenseCategoies,
      isUpdatingBenficaryTypes,
      isUpdatingExpenseCategories,
      isUpdatingPaymentModes,
      isFetchingBenficieryTypes,
      isFetchingPaymentModes,
      isFetchingExpenseCategories
    ]
  )

  const { errors, handleSubmit, fields } = useFormBuilder<ExpenseRequest>({
    formConfig: expenseFormConfig,
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
