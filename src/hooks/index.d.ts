type ValidationRule =
  | 'required'
  | 'number'
  | 'email'
  | 'mobile'
  | 'pincode'
  | 'aadhar'
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }

type FieldConfig<T> = {
  key: keyof T
  label: string
  type: InputTypes
  variant?: any
  rules?: ValidationRule[]
  dependsOn?: keyof T
  fetchOptions?: (value: any) => Promise<any>
  mapOptions?: (data: any) => { label: string; value: any }[]
  staticOptions?: any[]
  searchable?: boolean
  onSearch?: (searchText: string) => void
  onAddNew?: (text?: string) => void
  addNewLabel?: string
  onEdit?: (value: string | number, label: string) => void
  showYearDropdown?: boolean
  showMonthDropdown?: boolean
  yearDropdownItemNumber?: number

  // --- PROPS ---
  canEdit?: boolean
  isUpdating?: boolean
  isLoading?: boolean
  isOptionsLoading?: boolean
  isEditingLoading?: boolean
}
type FormConfig<T> = {
  formConfig: FieldConfig<T>[]
  initialValues: T
}

type ValidationError = { errorkey: string; error: string } | null

type RuleHandler = (value: any, isEmpty: boolean, keyStr: string) => ValidationError
