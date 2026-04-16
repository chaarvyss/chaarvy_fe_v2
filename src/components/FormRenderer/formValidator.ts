import { ErrorObject } from 'src/lib/types'

type ValidateFieldProps = {
  key: keyof any | string
  value: any
}

type ValidateFormProps<T extends Record<string, any>> = {
  mandatoryFields: Array<keyof T | string>
  values: T
  customValidation?: ({ key, value }: ValidateFieldProps) => ErrorObject | null
}

type ValidateFormResult = {
  isValid: boolean
  errors: ErrorObject[]
}

export const defaultValidateField = ({ key, value }: ValidateFieldProps): ErrorObject | null => {
  if (value === undefined || value === null || value === '') {
    return { errorkey: key as string, error: '* Required' }
  }

  switch (key) {
    case 'pincode':
      return /^[0-9]\d{5}$/.test(value) ? null : { errorkey: key, error: 'Invalid PINCODE number.' }
    default:
      return null
  }
}

const validateForm = <T extends Record<string, any>>({
  mandatoryFields,
  values,
  customValidation
}: ValidateFormProps<T>): ValidateFormResult => {
  const validateField = customValidation ?? defaultValidateField
  const errors: ErrorObject[] = []

  mandatoryFields.forEach(field => {
    const key = field as keyof T
    const value = values[key as keyof T]
    const error = validateField({ key, value })
    if (error) errors.push(error)
  })

  console.log('Validation errors:', { values, errors })

  return {
    isValid: errors.length === 0,
    errors
  }
}

export type { ValidateFormProps, ValidateFormResult }
export default validateForm
