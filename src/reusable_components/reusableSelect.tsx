import {
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material'

type Option = {
  label: string
  value: string
}

interface ReusableSelectProps {
  label: string
  value?: string | string[]
  options: Option[]
  isLoading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  multiple?: boolean
  onChange: (value: string | string[]) => void
}

const ReusableSelect = ({
  label,
  value,
  options,
  isLoading,
  disabled,
  fullWidth = true,
  multiple = false,
  onChange
}: ReusableSelectProps) => {
  const selectedValue = multiple ? (Array.isArray(value) ? value : []) : (value ?? '')

  return (
    <FormControl fullWidth={fullWidth} size='small' disabled={disabled}>
      <InputLabel>{label}</InputLabel>

      <Select
        label={label}
        multiple={multiple}
        value={selectedValue as string | string[]}
        displayEmpty
        onChange={(e: SelectChangeEvent<string | string[]>) => onChange(e.target.value as string | string[])}
        renderValue={selected => {
          if (multiple && Array.isArray(selected)) {
            return selected
              .map(item => options.find(o => o.value === item)?.label)
              .filter(Boolean)
              .join(', ')
          }

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
          options.map(opt => {
            const isSelected =
              multiple && Array.isArray(selectedValue) ? selectedValue.includes(opt.value) : selectedValue === opt.value

            return (
              <MenuItem key={opt.value} value={opt.value}>
                {multiple ? <Checkbox checked={isSelected} /> : null}
                <ListItemText primary={opt.label} />
              </MenuItem>
            )
          })
        )}
      </Select>
    </FormControl>
  )
}

export default ReusableSelect
