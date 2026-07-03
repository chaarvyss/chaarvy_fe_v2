import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import { useEffect, useMemo } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { getMandatoryFieldsList, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes } from 'src/lib/enums'
import { ChaarvyModal } from 'src/reusable_components'
import FormGenerator from 'src/reusable_components/formGenerator'
import { useCreateUpdateTodoMutation, useGetTodoDetailQuery } from 'src/store/services/common/todoServices'

interface CreateUpdateTodoProps {
  isOpen: boolean
  todo_id?: string
  onClose: () => void
}

const defaultTodo: Todo = {
  title: '',
  description: '',
  due_date: '',
  status: 0,
  priority: 'Low'
}

const CreateUpdateTodo = ({ isOpen, todo_id, onClose }: CreateUpdateTodoProps) => {
  const { triggerToast } = useToast()

  const [createUpdateTodo, { isLoading: isSubmitting }] = useCreateUpdateTodoMutation()
  const { data: todoDetail, isFetching: isFetchingTodoDetail } = useGetTodoDetailQuery(todo_id ?? '', {
    skip: !todo_id
  })

  const todoFormConfig: FieldConfig<Todo>[] = useMemo(
    () => [
      { key: 'title', label: 'Title', type: InputTypes.INPUT, rules: ['required'] },
      {
        key: 'description',
        label: 'Description',
        type: InputTypes.INPUT,
        rules: ['required'],
        rows: 3,
        variant: 'string'
      },

      {
        key: 'priority',
        label: 'Priority',
        type: InputTypes.SELECT,
        staticOptions: ['Low', 'Medium', 'High'].map((priority: string) => ({ value: priority, label: priority })),
        rules: ['required']
      },
      {
        key: 'due_date',
        label: 'Due Date',
        type: InputTypes.DATE,
        rules: ['required'],
        showYearDropdown: true,
        showMonthDropdown: true,
        yearDropdownItemNumber: 25,
        minDate: new Date(),
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
      }
    ],
    []
  )

  const { errors, handleSubmit, fields, setValues, shouldDisableSubmit } = useFormBuilder<Todo>({
    formConfig: todoFormConfig,
    initialValues: defaultTodo
  })

  const onSubmit = (data: Todo) => {
    createUpdateTodo(data)
      .unwrap()
      .then(() => {
        triggerToast('Todo saved successfully', {
          variant: ToastVariants.SUCCESS
        })
        onClose()
      })
      .catch(() => {
        triggerToast('Failed to save todo', {
          variant: ToastVariants.ERROR
        })
      })
  }

  useEffect(() => {
    if (todo_id) {
      if (todoDetail) {
        setValues(todoDetail)
      }
    } else {
      setValues(defaultTodo)
    }
  }, [todoDetail, todo_id])

  const renderFooter = () => (
    <Stack direction='row' justifyContent='end'>
      <LoadingButton
        onClick={handleSubmit(onSubmit)}
        variant='contained'
        color='primary'
        size='small'
        disabled={shouldDisableSubmit}
        loading={isSubmitting}
        sx={{ mt: 5, textTransform: 'none' }}
      >
        {todo_id ? 'Update' : 'Add'} Todo
      </LoadingButton>
    </Stack>
  )

  return (
    <ChaarvyModal isOpen={isOpen} onClose={onClose} title='Todo Details'>
      <FormGenerator
        fields={fields}
        errors={errors}
        mandatoryFields={getMandatoryFieldsList(todoFormConfig)}
        footer={renderFooter()}
        columnSize={{ sm: 12 }}
        isLoading={isFetchingTodoDetail}
      />
    </ChaarvyModal>
  )
}

export default CreateUpdateTodo
