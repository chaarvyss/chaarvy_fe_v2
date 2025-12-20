import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Box } from '@mui/material'
import { ChangeEvent, useState } from 'react'
import DatePicker from 'react-datepicker'

import { Grid, TextField } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { DateFormats, InputVariants } from 'src/lib/enums'
import { dateToString } from 'src/lib/helpers'
import { FilterProps } from 'src/lib/interfaces'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import { useGetProgramsListQuery, useGetRolesListQuery, useGetSectionsListQuery } from 'src/store/services/listServices'

type FieldTypes =
  | 'search'
  | 'program'
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
  const { data: programsList } = useGetProgramsListQuery(true)
  const { data: sections } = useGetSectionsListQuery()
  const { data: roles } = useGetRolesListQuery()

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const { closeDrawer } = useSideDrawer()

  const handleChange =
    (prop: keyof FilterProps) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event
      setFilters({ ...filters, [prop]: value })
    }

  const handleSubmit = event => {
    event?.preventDefault()
    const finalFilters = { ...filters, offset: 0 }

    let date: Date
    if (startDate) {
      date = new Date(startDate)
      finalFilters['startDate'] = dateToString(date, DateFormats.YearMonthDate)
    }

    if (endDate) {
      date = new Date(endDate)
      finalFilters['endDate'] = dateToString(date, DateFormats.YearMonthDate)
    }
    onSubmit(finalFilters)
  }
  const handleReset = () => {
    setFilters(undefined)
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
      <Grid container gap={4} display='flex' flexDirection='column'>
        {fields.includes('search') && (
          <Grid item>
            <TextField
              fullWidth
              type={InputVariants.STRING}
              label='Search'
              value={filters?.searchText ?? ''}
              onChange={handleChange('searchText')}
            />
          </Grid>
        )}
        {fields.includes('program') && (
          <FormControl fullWidth>
            <InputLabel>Program</InputLabel>
            <Select label='Program' value={filters?.program ?? ''} onChange={handleChange('program')}>
              {(programsList ?? []).map(({ program_id, program_name }) => (
                <MenuItem value={program_id}>{program_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {fields.includes('sections') && (
          <FormControl fullWidth>
            <InputLabel>Section</InputLabel>
            <Select label='Section' value={filters?.section ?? ''} onChange={handleChange('section')}>
              {(sections ?? []).map(({ section_id, section_name }) => (
                <MenuItem value={section_id}>{section_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {fields.includes('status') && (
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select label='Status' value={filters?.status_ ?? ''} onChange={handleChange('status_')}>
              {(statusOptions ?? []).map(({ label, value }) => (
                <MenuItem value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {fields.includes('role') && (
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select label='role' value={filters?.role ?? ''} onChange={handleChange('role')}>
              {(roles ?? []).map(({ role_name, role_id }) => (
                <MenuItem value={role_id}>{role_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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
        <Box gap={3} display='flex' justifyContent='space-between'>
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
