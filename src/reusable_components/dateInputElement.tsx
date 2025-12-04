import TextField, { TextFieldProps } from '@mui/material/TextField'
import { forwardRef } from 'react'

type CustomDateElementProps = TextFieldProps & {
  label: string
}

const CustomDateElement = forwardRef<HTMLInputElement, CustomDateElementProps>(({ label, ...props }, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label={label} autoComplete='off' />
})

export default CustomDateElement
