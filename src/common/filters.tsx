import { Button, Box } from '@mui/material'
import { ChangeEvent, useState } from 'react'
import DatePicker from 'react-datepicker'

import { Grid, TextField } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { DateFormats, InputVariants } from 'src/lib/enums'
import { dateToString } from 'src/lib/helpers'
import { FilterProps } from 'src/lib/interfaces'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import ReusableSelect from 'src/reusable_components/reusableSelect'
import {
  useGetProgramsListQuery,
  useGetRolesListQuery,
  useGetSectionsListQuery,
  useGetSegmentsListQuery,
  useGetUsersListQuery
} from 'src/store/services/listServices'

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

interface StatusOption {
  label: string
  value: string
}

interface RenderFilterProps {
  onSubmit: (data?: FilterProps) => void
  fields: Array<FieldTypes>
  statusOptions?: StatusOption[]
  defaultValues?: FilterProps
  resetFilters?: () => void
}

const RenderFilterOptions = ({ onSubmit, fields, statusOptions, defaultValues, resetFilters }: RenderFilterProps) => {
  // Initialize state with defaultValues so the form isn't blank
  const [filters, setFilters] = useState<FilterProps | undefined>(defaultValues)
  const { closeDrawer } = useSideDrawer()

  const { data: programsList, isFetching: isFetchingPrograms } = useGetProgramsListQuery(true, {
    skip: !fields.includes('program')
  })

  const { data: sections, isFetching: isFetchingSections } = useGetSectionsListQuery(undefined, {
    skip: !fields.includes('sections')
  })

  const { data: roles, isFetching: isFetchingRoles } = useGetRolesListQuery(undefined, {
    skip: !fields.includes('role')
  })

  const { data: segments, isFetching: isFetchingSegments } = useGetSegmentsListQuery(undefined, {
    skip: !fields.includes('segment')
  })

  const { data: usersList, isFetching: isFetchingUsers } = useGetUsersListQuery(
    { limit: 100 },
    {
      skip: !fields.includes('referred_by')
    }
  )

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

  return (
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
        {/* 🔍 Search */}
        {fields.includes('search') && (
          <Grid item>
            <TextField
              fullWidth
              type={InputVariants.STRING}
              label='Search'
              size='small'
              value={filters?.searchText ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('searchText')(e.target.value)}
            />
          </Grid>
        )}

        {/* 📘 Program */}
        {fields.includes('program') && (
          <ReusableSelect
            label='Program'
            value={filters?.program}
            isLoading={isFetchingPrograms}
            options={(programsList ?? []).map(p => ({
              value: p.program_id,
              label: p.program_name
            }))}
            onChange={handleChange('program')}
          />
        )}

        {/* 📚 Segment */}
        {fields.includes('segment') && (
          <ReusableSelect
            label='Segment'
            value={filters?.segment}
            isLoading={isFetchingSegments}
            options={(segments ?? []).map(s => ({
              value: s.segment_id,
              label: s.segment_name
            }))}
            onChange={handleChange('segment')}
          />
        )}

        {/* 🏫 Section */}
        {fields.includes('sections') && (
          <ReusableSelect
            label='Section'
            value={filters?.section}
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
        )}

        {/* 📊 Status */}
        {fields.includes('status') && (
          <ReusableSelect
            label='Status'
            value={filters?.status_}
            options={(statusOptions ?? []).map(s => ({
              value: s.value,
              label: s.label
            }))}
            onChange={handleChange('status_')}
          />
        )}

        {/* 👤 Role */}
        {fields.includes('role') && (
          <ReusableSelect
            label='Role'
            value={filters?.role}
            isLoading={isFetchingRoles}
            options={(roles ?? []).map(r => ({
              value: r.role_id,
              label: r.role_name
            }))}
            onChange={handleChange('role')}
          />
        )}

        {/* 👤 Role */}
        {fields.includes('referred_by') && (
          <ReusableSelect
            label='Referred by'
            value={filters?.referred_by}
            isLoading={isFetchingUsers}
            options={(usersList?.users ?? []).map(r => ({
              value: r.user_id,
              label: r.name
            }))}
            onChange={handleChange('referred_by')}
          />
        )}

        {/* 📅 Date Range */}
        {fields.includes('dateRange') && (
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
            placeholderText='Select date range'
          />
        )}

        {/* 🔘 Actions */}
        <Box display='flex' justifyContent='space-between'>
          <Button variant='outlined' onClick={handleReset}>
            Reset
          </Button>

          <Button variant='contained' onClick={handleSubmit}>
            Search
          </Button>
        </Box>
      </Grid>
    </form>
  )
}

export default RenderFilterOptions
