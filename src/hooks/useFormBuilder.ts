import { useEffect, useState } from 'react'

import { ErrorObject, InputFields } from 'src/lib/types'

export type ValidationRule =
  | 'required'
  | 'number'
  | 'email'
  | 'pincode'
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }

export type FieldConfig<T> = {
  key: keyof T
  label: string
  type: any
  variant?: any
  rules?: ValidationRule[]
  dependsOn?: keyof T
  fetchOptions?: (value: any) => Promise<any>
  mapOptions?: (data: any) => { label: string; value: any }[]
  staticOptions?: any[]
}

export type FormConfig<T> = {
  fields: FieldConfig<T>[]
  initialValues: T
}

type ValidationError = { errorkey: string; error: string } | null

type RuleHandler = (value: any, isEmpty: boolean, keyStr: string) => ValidationError

export const mapToFields = ({ config, values, handleChange, optionsMap, loadingMap }: any): InputFields[] => {
  return config.map(field => {
    const key = String(field.key)

    return {
      id: key,
      key,
      label: field.label,
      type: field.type,
      variant: field.variant,
      value: values[field.key],
      onChange: handleChange(field.key),
      menuOptions: optionsMap[key] ?? [],
      isLoading: loadingMap[key] ?? false
    }
  })
}

export const getMandatoryFieldsList = (config: FieldConfig<any>[]): string[] => {
  return config.filter(f => f.rules?.includes('required')).map(f => String(f.key))
}

export const useFormBuilder = <T extends Record<string, any>>({ fields, initialValues }: FormConfig<T>) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ErrorObject[]>([])
  const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [fetchedDeps, setFetchedDeps] = useState<Record<string, any>>({})

  const getValue = (e: any) => e?.target?.value ?? e

  // ✅ STATIC OPTIONS (e.g., states)
  useEffect(() => {
    const initialOptions: Record<string, any[]> = {}

    fields.forEach(field => {
      const key = String(field.key)

      if (Array.isArray(field.staticOptions) && field.staticOptions.length > 0) {
        const mapped = field.mapOptions ? field.mapOptions(field.staticOptions) : field.staticOptions

        initialOptions[key] = mapped
      }
    })

    if (Object.keys(initialOptions).length) {
      setOptionsMap(prev => ({ ...prev, ...initialOptions }))
    }
  }, [fields])

  // ✅ DEPENDENCY ENGINE (handles both initial values & user changes)
  useEffect(() => {
    const runDependencies = async () => {
      for (const field of fields) {
        if (!field.dependsOn || !field.fetchOptions) continue

        const parentKey = field.dependsOn
        const parentValue = values[parentKey]

        if (!parentValue) continue

        const fieldKey = String(field.key)

        // prevent duplicate API calls
        if (fetchedDeps[fieldKey] === parentValue) continue

        // reset dependent field if parent changes
        if (fetchedDeps[fieldKey] && fetchedDeps[fieldKey] !== parentValue) {
          setValues(prev => ({
            ...prev,
            [field.key]: ''
          }))
        }

        setLoadingMap(prev => ({ ...prev, [fieldKey]: true }))

        try {
          const data = await field.fetchOptions(parentValue)

          const mapped = field.mapOptions ? field.mapOptions(data) : data

          setOptionsMap(prev => ({
            ...prev,
            [fieldKey]: mapped
          }))

          setFetchedDeps(prev => ({
            ...prev,
            [fieldKey]: parentValue
          }))
        } catch {
          setOptionsMap(prev => ({
            ...prev,
            [fieldKey]: []
          }))
        } finally {
          setLoadingMap(prev => ({
            ...prev,
            [fieldKey]: false
          }))
        }
      }
    }

    runDependencies()
  }, [values, fields])

  // ✅ VALIDATION

  const isEmptyValue = (value: any) => value === null || value === undefined || value === ''

  const validateRequired = (isEmpty: boolean, keyStr: string) =>
    isEmpty ? { errorkey: keyStr, error: 'This field is required' } : null

  const validateNumber = (value: any, isEmpty: boolean, keyStr: string) =>
    !isEmpty && Number.isNaN(Number(value)) ? { errorkey: keyStr, error: 'Must be a number' } : null

  const validateEmail = (value: any, isEmpty: boolean, keyStr: string) =>
    !isEmpty && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? { errorkey: keyStr, error: 'Invalid email' } : null

  const validateLength = (rule: any, value: any, keyStr: string) => {
    if (rule.type === 'minLength' && value?.length < rule.value) {
      return {
        errorkey: keyStr,
        error: rule.message || `Minimum ${rule.value} characters required`
      }
    }

    if (rule.type === 'maxLength' && value?.length > rule.value) {
      return {
        errorkey: keyStr,
        error: rule.message || `Maximum ${rule.value} characters allowed`
      }
    }

    return null
  }

  const ruleHandlers: Record<string, RuleHandler> = {
    required: (_, isEmpty, keyStr) => validateRequired(isEmpty, keyStr),

    number: (value, isEmpty, keyStr) => validateNumber(value, isEmpty, keyStr),

    email: (value, isEmpty, keyStr) => validateEmail(value, isEmpty, keyStr)
  }

  const validateField = (key: keyof T, value: any) => {
    const field = fields.find(f => f.key === key)
    if (!field?.rules) return null

    const keyStr = String(key)
    const isEmpty = isEmptyValue(value)

    for (const rule of field.rules) {
      let error: ValidationError = null

      if (typeof rule === 'string') {
        const handler = ruleHandlers[rule]
        error = handler?.(value, isEmpty, keyStr) ?? null
      } else {
        error = validateLength(rule, value, keyStr)
      }

      if (error) return error
    }

    return null
  }

  // ✅ HANDLE CHANGE (pure, no side-effects)

  const updateErrors = (key: keyof T, value: any) => {
    const keyStr = String(key)
    const error = validateField(key, value)
    const updatedErrors = (prev: ErrorObject[]) => {
      const filtered = prev.filter(e => e.errorkey !== keyStr)

      return error ? [...filtered, error] : filtered
    }
    setErrors(updatedErrors)
  }

  const handleChange = (key: keyof T) => (input: any) => {
    const value = getValue(input)
    updateErrors(key, value)

    setValues(prev => ({ ...prev, [key]: value }))
  }

  // ✅ FORM VALIDATION
  const validateForm = () => {
    const newErrors: ErrorObject[] = []

    fields.forEach(field => {
      const error = validateField(field.key, values[field.key])
      if (error) newErrors.push(error)
    })

    setErrors(newErrors)

    return { isValid: newErrors.length === 0 }
  }

  // ✅ SUBMIT
  const handleSubmit = (onSubmit: (values: T) => void) => async () => {
    const { isValid } = validateForm()
    if (!isValid) return
    onSubmit(values)
  }

  return {
    values,
    errors,
    optionsMap,
    loadingMap,
    handleChange,
    handleSubmit,
    setValues,
    setOptionsMap
  }
}
