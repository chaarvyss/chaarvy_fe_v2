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
  useGetSegmentsListQuery
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

interface StatusOption {
  label: string
  value: string
}

interface RenderFilterProps {
  onSubmit: (data?: FilterProps) => void
  fields: Array<FieldTypes>
  statusOptions?: StatusOption[]
}

const RenderFilterOptions = ({ onSubmit, fields, statusOptions }: RenderFilterProps) => {
  const [filters, setFilters] = useState<FilterProps>()
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

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const handleChange = (prop: keyof FilterProps) => (value: any) => {
    setFilters(prev => ({ ...prev, [prop]: value }))
  }

  const handleSubmit = (event?: any) => {
    event?.preventDefault()

    const finalFilters = { ...filters, offset: 0 }

    if (startDate) {
      finalFilters.startDate = dateToString(startDate, DateFormats.YearMonthDate)
    }

    if (endDate) {
      finalFilters.endDate = dateToString(endDate, DateFormats.YearMonthDate)
    }

    onSubmit(finalFilters)
  }

  const handleReset = () => {
    setFilters(undefined)
    setStartDate(null)
    setEndDate(null)
    onSubmit(undefined)
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
            options={(sections ?? []).map(s => ({
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
