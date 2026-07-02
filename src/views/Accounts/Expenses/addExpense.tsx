import { LoadingButton } from '@mui/lab'
import { Stack, Box, Button, Typography, List, ListItem, IconButton, LinearProgress } from '@mui/material'
import { useMemo, useEffect, useState, ChangeEvent } from 'react'

import { useImageViewer } from 'src/@core/context/imageViewerContext'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { FieldConfig, getMandatoryFieldsList, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes, InputVariants } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'
import { useGetPayeesListQuery } from 'src/store/services/adminServices'
import {
  useCreateUpdateExpenseCategoryTypeMutation,
  useCreateUpdateExpenseMutation,
  useGetExpenseDetailQuery,
  useGetExpenseFilesQuery,
  useDeleteExpenseFilesMutation,
  useCreateUpdatePaymentModeMutation,
  useGenerateExpenseUploadUrlsMutation
} from 'src/store/services/common/expenseServices'
import {
  useGetBenificeryTypesListQuery,
  useGetExpenseCategoryTypesListQuery
} from 'src/store/services/common/listServices'
import { useGetPaymentModesListQuery, useGetUsersListQuery } from 'src/store/services/listServices'
import { uploadFilesToAzure } from 'src/utils/azureUploadHelper'
import { useDebounce } from 'src/utils/hooks/useDebounce'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

interface AddExpenseProps {
  expenseId?: string
  onSuccess: () => void
}

// Track file and its individual upload progress
interface SelectedFile {
  file: File
  progress: number
}

const defaultFormValues = {
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

const AddExpense = ({ expenseId, onSuccess }: AddExpenseProps) => {
  const { closeDrawer, isOpen } = useSideDrawer()
  const { triggerToast } = useToast()

  // --- Local State for Files ---
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [existingFiles, setExistingFiles] = useState<any[]>([])
  const [filesToDelete, setFilesToDelete] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { setShowImage } = useImageViewer()

  const [payeeSearchText, setPayeeSearchText] = useState<string>()
  const [benficeryTypeId, setBenficeryTypeId] = useState<string>()

  const [usersListProps, setUsersListProps] = useState({ limit: 20, offset: 0, searchText: '' })

  const userProps = useDebounce(usersListProps)

  // --- API Hooks ---
  const { data: expenseDetail, isFetching: isFetchingExpenseDetail } = useGetExpenseDetailQuery(expenseId ?? '', {
    skip: !expenseId
  })

  const { data: filesData, isFetching: isFetchingFiles } = useGetExpenseFilesQuery(expenseId ?? '', {
    skip: !expenseId
  })

  const { data: benficerTypes, isFetching: isFetchingBenficieryTypes } = useGetBenificeryTypesListQuery()
  const { data: expenseCategoies, isFetching: isFetchingExpenseCategories } = useGetExpenseCategoryTypesListQuery()
  const { data: paymentModes, isFetching: isFetchingPaymentModes } = useGetPaymentModesListQuery()
  const { data: usersList, isFetching: isFetchingUsersList } = useGetUsersListQuery(userProps, { skip: !isOpen })

  const debouncedPayeeSearchText = useDebounce(payeeSearchText)
  const { data: payeesList, isFetching: isFetchingPayeesList } = useGetPayeesListQuery(
    { benficery_type_id: benficeryTypeId ?? '', search_text: debouncedPayeeSearchText },
    { skip: !benficeryTypeId || !isOpen }
  )

  const [createUpdateExpenceCategoryType, { isLoading: isUpdatingExpenseCategories }] =
    useCreateUpdateExpenseCategoryTypeMutation()
  const [createUpdatePaymentMode, { isLoading: isUpdatingPaymentModes }] = useCreateUpdatePaymentModeMutation()
  const [addExpenseRecord, { isLoading: isUpdatingRecord }] = useCreateUpdateExpenseMutation()

  const [generateUploadUrls] = useGenerateExpenseUploadUrlsMutation()

  const [deleteExpenseFiles] = useDeleteExpenseFilesMutation()

  const expenseFormConfig: FieldConfig<ExpenseRequest>[] = useMemo(
    () => [
      { key: 'description', label: 'Description', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'expense_date', label: 'Date', type: InputTypes.DATE, rules: ['required'] },
      {
        key: 'expense_by',
        label: 'Paid by',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: usersList?.users ?? [],
        searchable: true,
        mapOptions: (data: any[]) => data?.map(s => ({ label: s.name, value: s.user_id })) ?? [],
        onSearch: (searchText: string) => {
          setUsersListProps({ ...usersListProps, searchText })
        },
        isUpdating: isFetchingUsersList,
        canEdit: false,
        isOptionsLoading: isFetchingUsersList
      },
      {
        key: 'benficery_type_id',
        label: 'Benficery type',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: benficerTypes,
        isOptionsLoading: isFetchingBenficieryTypes,
        searchable: true,
        mapOptions: (data: any[]) =>
          data?.map(s => ({ label: s.benficery_type_name, value: s.benficery_type_id })) ?? []
      },
      {
        key: 'benficery',
        dependsOn: 'benficery_type_id',
        label: 'Payee',
        fetchOptions: async (benficery_type_id: string) => {
          setBenficeryTypeId(benficery_type_id)
        },
        searchable: true,
        onSearch: (searchText: string) => {
          setPayeeSearchText(searchText)
        },
        isOptionsLoading: isFetchingPayeesList,
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: payeesList ?? [],
        mapOptions: (data: any[]) => data?.map(s => ({ label: s.label, value: s.value })) ?? []
      },
      {
        key: 'category_id',
        label: 'Expense Category',
        type: InputTypes.SELECT,
        rules: ['required'],
        staticOptions: expenseCategoies,
        onAddNew: async (text?: string) => {
          if (!text) return
          createUpdateExpenceCategoryType({ category_name: text })
        },
        isOptionsLoading: isFetchingExpenseCategories,
        addNewLabel: 'Add expense category',
        searchable: true,
        isUpdating: isUpdatingExpenseCategories,
        onEdit: (id, value) => {
          createUpdateExpenceCategoryType({ category_id: String(id), category_name: value })
        },
        mapOptions: (data: any[]) => data?.map(s => ({ label: s.category_name, value: s.category_id })) ?? []
      },
      { key: 'reference_id', label: 'Reference id', type: InputTypes.INPUT, rules: ['required'] },
      { key: 'remarks', label: 'Notes', type: InputTypes.INPUT, rules: ['required'] },
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
        mapOptions: (data: any[]) => data?.map(s => ({ label: s.payment_mode, value: s.payment_mode_id })) ?? []
      },
      { key: 'amount', label: 'Amount', type: InputTypes.INPUT, variant: InputVariants.NUMBER, rules: ['required'] }
    ],
    [
      paymentModes,
      benficerTypes,
      expenseCategoies,
      isUpdatingExpenseCategories,
      isUpdatingPaymentModes,
      isFetchingBenficieryTypes,
      isFetchingPaymentModes,
      isFetchingExpenseCategories,
      usersList,
      payeesList
    ]
  )

  const { errors, handleSubmit, fields, setValues, shouldDisableSubmit } = useFormBuilder<ExpenseRequest>({
    formConfig: expenseFormConfig,
    initialValues: defaultFormValues
  })

  // --- Reset & Sync State ---
  useEffect(() => {
    if (isOpen) {
      if (expenseId && expenseDetail) setValues(expenseDetail)
      else if (!expenseId) setValues(defaultFormValues)

      if (filesData?.files) setExistingFiles(filesData.files)
    } else {
      onSuccess()
      setValues(defaultFormValues)
      setSelectedFiles([])
      setExistingFiles([])
      setFilesToDelete([])
      setIsProcessing(false)
    }
  }, [isOpen, expenseDetail, expenseId, setValues, filesData])

  // --- File Selection Handlers ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, progress: 0 }))
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingFile = (fileId: string) => {
    setExistingFiles(prev => prev.filter(f => f.file_id !== fileId))
    setFilesToDelete(prev => [...prev, fileId])
  }

  // --- Master Submit Handler ---
  const onSubmit = async (data: ExpenseRequest) => {
    try {
      setIsProcessing(true)

      // 1. Create/Update Expense record
      const response = await addExpenseRecord({ ...data, ...(expenseId ? { expense_id: expenseId } : {}) }).unwrap()
      const targetExpenseId = expenseId || response.expense_id

      // 2. Process Deletions
      if (filesToDelete.length > 0) {
        await deleteExpenseFiles({ expense_id: targetExpenseId, file_ids: filesToDelete }).unwrap()
      }

      // 3. Process Uploads
      if (selectedFiles.length > 0 && targetExpenseId) {
        const fileNames = selectedFiles.map(sf => sf.file.name)
        const urlsResponse = await generateUploadUrls({ expense_id: targetExpenseId, file_names: fileNames }).unwrap()

        const uploadTargets = urlsResponse.map((data: any) => {
          const actualFile = selectedFiles.find(sf => sf.file.name === data.file_name)?.file

          return { file: actualFile!, uploadUrl: data.upload_url }
        })

        await uploadFilesToAzure(uploadTargets, {
          onProgress: (percent, fileName) => {
            setSelectedFiles(prev => prev.map(sf => (sf.file.name === fileName ? { ...sf, progress: percent } : sf)))
          }
        })
      }

      // 4. Resolve Success
      triggerToast(`Expense record ${expenseId ? 'updated' : 'added'} successfully`, { variant: ToastVariants.SUCCESS })
      onSuccess()
      closeDrawer()
    } catch (e: any) {
      triggerToast(e?.message || 'Error processing expense or files', { variant: ToastVariants.ERROR })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDocumentView = (file: any) => {
    if (file.file_name.endsWith('.pdf')) {
      window.open(file.url, '_blank')
    } else {
      setShowImage?.(file.url)
    }
  }

  // --- UI Renders ---
  const renderFileAttachmentsSection = () => (
    <Box sx={{ mt: 4, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
      <Typography variant='subtitle2' sx={{ mb: 2 }}>
        Attachments
      </Typography>

      <Button variant='outlined' component='label' size='small' disabled={isProcessing}>
        Select Files
        {/* Enforce images and PDFs only */}
        <input type='file' accept='image/*,application/pdf' multiple hidden onChange={handleFileChange} />
      </Button>

      <List dense sx={{ mt: 2 }}>
        {/* Existing Files */}
        {existingFiles.map(file => (
          <ListItem
            key={file.file_id}
            secondaryAction={
              <IconButton
                edge='end'
                size='small'
                onClick={() => removeExistingFile(file.file_id)}
                disabled={isProcessing}
              >
                <GetChaarvyIcons iconName={ChaarvyIcon.Close} fontSize='1.25rem' />
              </IconButton>
            }
          >
            <Typography variant='body2' component='a' onClick={() => handleDocumentView(file)} color='primary'>
              {file.file_name}
            </Typography>
          </ListItem>
        ))}

        {/* Newly Selected Files with Progress Bars */}
        {selectedFiles.map((sf, idx) => (
          <ListItem key={`${sf.file.name}-${idx}`} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography variant='body2' color='textSecondary'>
                {sf.file.name}
              </Typography>
              <IconButton edge='end' size='small' onClick={() => removeSelectedFile(idx)} disabled={isProcessing}>
                <GetChaarvyIcons iconName={ChaarvyIcon.Close} fontSize='1.25rem' />
              </IconButton>
            </Box>
            {/* Show progress bar when processing starts */}
            {isProcessing && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress variant='determinate' value={sf.progress} />
                <Typography variant='caption' color='textSecondary' align='right' display='block'>
                  {sf.progress}%
                </Typography>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  )

  const renderFooter = () => (
    <Stack direction='row' justifyContent='end'>
      <LoadingButton
        onClick={handleSubmit(onSubmit)}
        variant='contained'
        color='primary'
        size='small'
        disabled={shouldDisableSubmit || isProcessing || isUpdatingRecord}
        sx={{ mt: 5, textTransform: 'none' }}
        loading={isProcessing || isUpdatingRecord}
      >
        {expenseId ? 'Update' : 'Add'} expense
      </LoadingButton>
    </Stack>
  )

  return (
    <>
      <FormGenerator
        fields={fields}
        errors={errors}
        mandatoryFields={getMandatoryFieldsList(expenseFormConfig)}
        isLoading={isFetchingExpenseDetail || isFetchingFiles}
        footer={
          <>
            {renderFileAttachmentsSection()}
            {renderFooter()}
          </>
        }
      />
    </>
  )
}

export default AddExpense
