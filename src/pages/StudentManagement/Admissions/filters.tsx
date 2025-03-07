import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Box } from '@mui/material'
import { Grid, TextField } from '@muiElements'
import { ChangeEvent, useState } from 'react'
import { InputVariants } from 'src/lib/enums'
import { useGetProgramsListQuery } from 'src/store/services/listServices'

interface RenderAdmissionFilterProps {
  onSubmit: (data?: RenderAdmissionsFilters) => void
}

export interface RenderAdmissionsFilters {
  searchText?: string
  program?: string
  medium?: string
}

const RenderAdmissionFilterOptions = ({ onSubmit }: RenderAdmissionFilterProps) => {
  const [filters, setFilters] = useState<RenderAdmissionsFilters>()
  const { data: programsList } = useGetProgramsListQuery(true)

  const handleChange =
    (prop: keyof RenderAdmissionsFilters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event
      setFilters({ ...filters, [prop]: value })
    }

  return (
    <Grid container gap={4}>
      <Grid item>
        <TextField
          fullWidth
          type={InputVariants.STRING}
          label='Search'
          value={filters?.searchText ?? ''}
          onChange={handleChange('searchText')}
        />
      </Grid>
      <FormControl fullWidth>
        <InputLabel>Program</InputLabel>
        <Select label='Program' value={filters?.program ?? ''} onChange={handleChange('program')}>
          {(programsList ?? []).map(({ program_id, program_name }) => (
            <MenuItem value={program_id}>{program_name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box gap={3} display='flex' justifyContent='space-between'>
        <Button variant='outlined' onClick={() => setFilters(undefined)}>
          Reset
        </Button>
        <Button variant='contained' onClick={() => onSubmit(filters)}>
          Search
        </Button>
      </Box>
    </Grid>
  )
}

export default RenderAdmissionFilterOptions
