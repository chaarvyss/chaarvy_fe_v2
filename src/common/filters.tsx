import { Button, Box, Stack } from '@mui/material'
import { ChangeEvent, ReactNode, useState } from 'react'
import DatePicker from 'react-datepicker'

import { Grid, TextField } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { DateFormats, InputVariants } from 'src/lib/enums'
import { dateToString } from 'src/lib/helpers'
import { FilterProps } from 'src/lib/interfaces'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import ReusableSelect from 'src/reusable_components/reusableSelect'
import {
  useGetBenificeryTypesListQuery,
  useGetExpenseCategoryTypesListQuery
} from 'src/store/services/common/listServices'
import {
  useGetProgramsListQuery,
  useGetRolesListQuery,
  useGetSectionsListQuery,
  useGetSegmentsListQuery,
  useGetUsersListQuery,
  useGetPaymentModesListQuery
} from 'src/store/services/listServices'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

type FieldTypes =
  | 'search'
  | 'program'
  | 'segment'
  | 'medium'
  | 'startDate'
  | 'endDate'
  | 'dateRange'
  | 'sections'
  | 'status'
  | 'role'
  | 'referred_by'
  | 'benficery_types'
  | 'expense_category_types'
  | 'payment_modes'

interface FilterFieldConfig {
  fieldType: FieldTypes
  isMultiselect?: boolean
}

type FilterField = FieldTypes | FilterFieldConfig

interface StatusOption {
  label: string
  value: string
}

interface RenderFilterProps {
  onSubmit: (data?: FilterProps) => void
  fields: Array<FilterField>
  statusOptions?: StatusOption[]
  defaultValues?: FilterProps
  resetFilters?: () => void
  children?: Array<ReactNode>
}

const RenderFilterOptions = ({
  onSubmit,
  fields,
  statusOptions,
  defaultValues,
  resetFilters,
  children = []
}: RenderFilterProps) => {
  // Initialize state with defaultValues so the form isn't blank
  const [filters, setFilters] = useState<FilterProps | undefined>(defaultValues)
  const { closeDrawer } = useSideDrawer()
  const normalizedFields = fields.map(field => (typeof field === 'string' ? { fieldType: field } : field))

  const hasField = (fieldType: FieldTypes) => normalizedFields.some(field => field.fieldType === fieldType)

  const { data: programsList, isFetching: isFetchingPrograms } = useGetProgramsListQuery(true, {
    skip: !hasField('program')
  })

  const { data: sections, isFetching: isFetchingSections } = useGetSectionsListQuery(undefined, {
    skip: !hasField('sections')
  })

  const { data: roles, isFetching: isFetchingRoles } = useGetRolesListQuery(undefined, {
    skip: !hasField('role')
  })

  const { data: segments, isFetching: isFetchingSegments } = useGetSegmentsListQuery(undefined, {
    skip: !hasField('segment')
  })

  const { data: usersList, isFetching: isFetchingUsers } = useGetUsersListQuery(
    { limit: 100 },
    {
      skip: !hasField('referred_by')
    }
  )

  const { data: benficerTypes } = useGetBenificeryTypesListQuery(undefined, {
    skip: !hasField('benficery_types')
  })
  const { data: expenseCategoies } = useGetExpenseCategoryTypesListQuery(undefined, {
    skip: !hasField('expense_category_types')
  })
  const { data: paymentModes } = useGetPaymentModesListQuery(undefined, {
    skip: !hasField('payment_modes')
  })

  // Initialize dates from strings if they exist in defaultValues
  const [startDate, setStartDate] = useState<Date | null>(
    defaultValues?.startDate ? new Date(defaultValues.startDate) : null
  )
  const [endDate, setEndDate] = useState<Date | null>(defaultValues?.endDate ? new Date(defaultValues.endDate) : null)

  const handleChange = (prop: keyof FilterProps) => (value: any) => {
    setFilters(prev => ({ ...prev, [prop]: value }))
  }

  const handleSubmit = (event?: any) => {
    event?.preventDefault()

    // When searching, always reset pagination to page 1
    const finalFilters = { ...filters, offset: 0 }

    if (startDate) {
      finalFilters.startDate = dateToString(startDate, DateFormats.YearMonthDate)
    } else {
      delete finalFilters.startDate
    }

    if (endDate) {
      finalFilters.endDate = dateToString(endDate, DateFormats.YearMonthDate)
    } else {
      delete finalFilters.endDate
    }

    onSubmit(finalFilters)
    closeDrawer() // Optional: Close drawer automatically on search
  }

  const handleReset = () => {
    resetFilters?.()
    setFilters(undefined)
    setStartDate(null)
    setEndDate(null)

    // Pass an object with offset: 0 to clear filters but maintain pagination structure
    onSubmit({ limit: defaultValues?.limit ?? 20, offset: 0 })
    closeDrawer()
  }

  const renderFilterField = (field: FilterFieldConfig, index: number) => {
    const { fieldType, isMultiselect = false } = field

    const renderChildren =
      children.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 2 }}>{children}</Box>
      ) : null

    switch (fieldType) {
      case 'search':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <TextField
              fullWidth
              type={InputVariants.STRING}
              label='Search'
              size='small'
              value={filters?.searchText ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('searchText')(e.target.value)}
            />
            {renderChildren}
          </Grid>
        )

      case 'program':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Program'
              value={isMultiselect ? (Array.isArray(filters?.program) ? filters.program : []) : filters?.program}
              multiple={isMultiselect}
              isLoading={isFetchingPrograms}
              options={(programsList ?? []).map(p => ({
                value: p.program_id,
                label: p.program_name
              }))}
              onChange={handleChange('program')}
            />
            {renderChildren}
          </Grid>
        )

      case 'segment':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Segment'
              value={isMultiselect ? (Array.isArray(filters?.segment) ? filters.segment : []) : filters?.segment}
              multiple={isMultiselect}
              isLoading={isFetchingSegments}
              options={(segments ?? []).map(s => ({
                value: s.segment_id,
                label: s.segment_name
              }))}
              onChange={handleChange('segment')}
            />
            {renderChildren}
          </Grid>
        )

      case 'sections':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Section'
              value={isMultiselect ? (Array.isArray(filters?.section) ? filters.section : []) : filters?.section}
              multiple={isMultiselect}
              isLoading={isFetchingSections}
              options={(sections ?? [])
                .filter(
                  (each): each is { section_id: string; section_name: string } =>
                    typeof each.section_id === 'string' && each.section_id !== ''
                )
                .map(s => ({
                  value: s.section_id,
                  label: s.section_name
                }))}
              onChange={handleChange('section')}
            />
            {renderChildren}
          </Grid>
        )

      case 'status':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Status'
              value={isMultiselect ? (Array.isArray(filters?.status_) ? filters.status_ : []) : filters?.status_}
              multiple={isMultiselect}
              options={(statusOptions ?? []).map(s => ({
                value: s.value,
                label: s.label
              }))}
              onChange={handleChange('status_')}
            />
            {renderChildren}
          </Grid>
        )

      case 'role':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Role'
              value={isMultiselect ? (Array.isArray(filters?.role) ? filters.role : []) : filters?.role}
              multiple={isMultiselect}
              isLoading={isFetchingRoles}
              options={(roles ?? []).map(r => ({
                value: r.role_id,
                label: r.role_name
              }))}
              onChange={handleChange('role')}
            />
            {renderChildren}
          </Grid>
        )

      case 'referred_by':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Referred by'
              value={
                isMultiselect ? (Array.isArray(filters?.referred_by) ? filters.referred_by : []) : filters?.referred_by
              }
              multiple={isMultiselect}
              isLoading={isFetchingUsers}
              options={(usersList?.users ?? []).map(r => ({
                value: r.user_id,
                label: r.name
              }))}
              onChange={handleChange('referred_by')}
            />
            {renderChildren}
          </Grid>
        )

      case 'benficery_types':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Beneficiary type'
              value={
                isMultiselect
                  ? Array.isArray(filters?.benficery_type_id)
                    ? filters.benficery_type_id
                    : []
                  : filters?.benficery_type_id
              }
              multiple={isMultiselect}
              options={(benficerTypes ?? []).map(item => ({
                value: item.benficery_type_id ?? '',
                label: item.benficery_type_name ?? ''
              }))}
              onChange={handleChange('benficery_type_id')}
            />
            {renderChildren}
          </Grid>
        )

      case 'expense_category_types':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Expense category'
              value={
                isMultiselect
                  ? Array.isArray(filters?.expense_category_id)
                    ? filters.expense_category_id
                    : []
                  : filters?.expense_category_id
              }
              multiple={isMultiselect}
              options={(expenseCategoies ?? []).map(item => ({
                value: String(item.category_id ?? ''),
                label: String(item.category_name ?? '')
              }))}
              onChange={handleChange('expense_category_id')}
            />
            {renderChildren}
          </Grid>
        )

      case 'payment_modes':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <ReusableSelect
              label='Payment mode'
              value={
                isMultiselect
                  ? Array.isArray(filters?.payment_mode)
                    ? filters.payment_mode
                    : []
                  : filters?.payment_mode
              }
              multiple={isMultiselect}
              options={(paymentModes ?? []).map(item => ({
                value: item.payment_mode_id,
                label: item.payment_mode
              }))}
              onChange={handleChange('payment_mode')}
            />
            {renderChildren}
          </Grid>
        )

      case 'dateRange':
        return (
          <Grid item key={`${fieldType}-${index}`}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              customInput={<CustomDateElement label='' />}
              onChange={dates => {
                const [start, end] = dates
                setStartDate(start)
                setEndDate(end)
              }}
              isClearable
              popperClassName='date-picker-popper'
              placeholderText='Select date range'
              showMonthDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={40}
            />
            {renderChildren}
          </Grid>
        )

      default:
        return null
    }
  }

  return (
    <DatePickerWrapper>
      <form
        onSubmit={handleSubmit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      >
        <Grid container gap={4} flexDirection='column'>
          <Stack direction='column' gap={4} width={'95%'}>
            {normalizedFields.map((field, index) => renderFilterField(field, index))}

            {/* 🔘 Actions */}
            <Box display='flex' justifyContent='space-between'>
              <Button variant='outlined' onClick={handleReset}>
                Reset
              </Button>

              <Button variant='contained' onClick={handleSubmit}>
                Search
              </Button>
            </Box>
          </Stack>
        </Grid>
      </form>
    </DatePickerWrapper>
  )
}

export default RenderFilterOptions
