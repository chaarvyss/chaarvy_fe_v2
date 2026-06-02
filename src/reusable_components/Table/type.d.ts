export type ChaarvyTableColumn<T = any> = {
  id: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  hideable?: boolean
  defaultHidden?: boolean
  editable?: boolean
  readonly?: boolean
  inputType?: 'text' | 'number' | 'select' | 'checkbox'
  inputLabel?: string
  uniqueOptionsOnly?: boolean
  options?: { label: string; value: any }[]
  render?: (row: T, index: number) => ReactNode
  headerSx?: Record<string, any>
  cellSx?: Record<string, any>
}

export type EditedDataTableOnSubmitPayload<T = any> = {
  created: T[]
  updated: T[]
  deleted: T[]
}

export type ChaarvyDataTableProps<T = any> = {
  columns: ChaarvyTableColumn<T>[]
  data: T[]
  getRowKey: (row: T, index: number) => string | number
  editable?: boolean
  onSubmit?: (payload: EditedDataTableOnSubmitPayload<T>) => void
  emptyMessage?: string
  hover?: boolean
  showColumnToggle?: boolean
  isLoading?: boolean
  loadingText?: string
  isSubmitting?: boolean
  showDefaultEntryButton?: boolean
  defaultEntryData?: T[]
  shouldHideActions?: boolean
}
