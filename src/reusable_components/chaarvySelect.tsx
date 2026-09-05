import { Select, SelectProps, MenuItem, Typography, Box } from '@mui/material'
import React, { ReactNode } from 'react'

export interface SelectOption {
  label: string | number | ReactNode
  value: string | number
  isDisabled?: boolean
}

// Extend SelectProps but omit 'children' since we are using 'options'
export interface ChaarvySelectProps extends Omit<SelectProps, 'children'> {
  options: SelectOption[]
  placeholder?: string
  label: string
  isRequired?: boolean
}

const ChaarvySelect: React.FC<ChaarvySelectProps> = ({ label, options, placeholder, isRequired, sx, ...props }) => {
  return (
    <Box>
      {label && (
        <Typography variant='body2' fontWeight={600} color='text.secondary'>
          {label} {isRequired && '*'}
        </Typography>
      )}
      <Select
        {...props}
        displayEmpty={Boolean(placeholder)}
        size='small'
        sx={{
          borderRadius: '8px',

          '& .MuiSelect-select': {
            padding: '12px 14px'
          },
          ...sx
        }}
      >
        {placeholder && (
          <MenuItem value='' disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map(option => (
          <MenuItem key={option.value} value={option.value} disabled={option.isDisabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}

export default ChaarvySelect
