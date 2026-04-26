import { CircularProgress, FormControl, MenuItem, Select, SelectChangeEvent, InputLabel } from '@mui/material'

type Option = {
  label: string
  value: string
}

interface ReusableSelectProps {
  label: string
  value?: string
  options: Option[]
  isLoading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  onChange: (value: string) => void
}

const ReusableSelect = ({
  label,
  value,
  options,
  isLoading,
  disabled,
  fullWidth = true,
  onChange
}: ReusableSelectProps) => {
  return (
    <FormControl fullWidth={fullWidth} size='small' disabled={disabled}>
      <InputLabel>{label}</InputLabel>

      <Select
        label={label}
        value={value ?? ''}
        displayEmpty
        onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
        renderValue={selected => {
          return options.find(o => o.value === selected)?.label
        }}
      >
        {isLoading ? (
          <MenuItem disabled>
            <CircularProgress size={20} />
          </MenuItem>
        ) : options.length === 0 ? (
          <MenuItem disabled>No Data</MenuItem>
        ) : (
          options.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  )
}

export default ReusableSelect
