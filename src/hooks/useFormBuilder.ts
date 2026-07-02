import { useCallback, useEffect, useMemo, useState, useRef } from 'react'

import { dateToString } from 'src/lib/helpers'
import { ErrorObject, InputFields } from 'src/lib/types'

export const mapToFields = ({ config, values, handleChange, optionsMap, loadingMap }: any): InputFields[] => {
  return config.map((field: any) => {
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
      isLoading: loadingMap[key] ?? field.isLoading ?? false,
      searchable: field.searchable,
      onSearch: field.onSearch,
      onAddNew: field.onAddNew,
      addNewLabel: field.addNewLabel,
      canEdit: field.canEdit,
      onEdit: field.onEdit,
      isUpdating: field.isUpdating,
      isOptionsLoading: field.isOptionsLoading,
      showYearDropdown: field.showYearDropdown,
      showMonthDropdown: field.showMonthDropdown,
      yearDropdownItemNumber: field.yearDropdownItemNumber,
      minDate: field.minDate,
      maxDate: field.maxDate
    }
  })
}

export const getMandatoryFieldsList = (config: FieldConfig<any>[]): string[] => {
  return config.filter(f => f.rules?.includes('required')).map(f => String(f.key))
}

export const useFormBuilder = <T extends Record<string, any>>({ formConfig, initialValues }: FormConfig<T>) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<ErrorObject[]>([])
  const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  // ✅ FIX: Use useRef to track dependencies to avoid infinite re-renders
  const fetchedDeps = useRef<Record<string, any>>({})

  const getValue = (e: any) => e?.target?.value ?? e

  // Moved up so it can be used inside the Dependency Engine
  const isEmptyValue = useCallback((value: any) => value === null || value === undefined || value === '', [])

  // ✅ STATIC OPTIONS
  useEffect(() => {
    const initialOptions: Record<string, any[]> = {}

    formConfig.forEach(field => {
      const key = String(field.key)

      if (Array.isArray(field.staticOptions) && field.staticOptions.length > 0) {
        const mapped = field.mapOptions ? field.mapOptions(field.staticOptions) : field.staticOptions
        initialOptions[key] = mapped
      }
    })

    if (Object.keys(initialOptions).length) {
      setOptionsMap(prev => ({ ...prev, ...initialOptions }))
    }
  }, [formConfig])

  // ✅ DEPENDENCY ENGINE (Handles resets, search clearing, and fetching)
  useEffect(() => {
    let isMounted = true

    const runDependencies = async () => {
      for (const field of formConfig) {
        if (!field.dependsOn) continue

        const parentKey = field.dependsOn
        const parentValue = values[parentKey]
        const fieldKey = String(field.key)
        const currentValue = values[field.key]
        const lastFetchedParent = fetchedDeps.current[fieldKey]

        // SCENARIO 1: Parent is Empty (e.g., user cleared the parent field)
        if (isEmptyValue(parentValue)) {
          // Clear child value and search text
          if (!isEmptyValue(currentValue)) {
            setValues(prev => ({ ...prev, [field.key]: '' as any }))
            if (field.searchable && field.onSearch) field.onSearch('')
          }

          // Clear child options
          if (lastFetchedParent !== undefined) {
            setOptionsMap(prev => ({ ...prev, [fieldKey]: [] }))
            fetchedDeps.current[fieldKey] = undefined // Reset tracking
          }
          continue
        }

        // SCENARIO 2: Parent value hasn't changed since last run -> Skip
        if (lastFetchedParent === parentValue) continue

        // SCENARIO 3: Parent value CHANGED to a new valid value
        // Clear child value & search field BEFORE fetching new options
        if (lastFetchedParent !== undefined) {
          setValues(prev => ({ ...prev, [field.key]: '' as any }))
          if (field.searchable && field.onSearch) field.onSearch('')
        }

        // Update tracking ref to prevent infinite loops
        fetchedDeps.current[fieldKey] = parentValue

        // If no fetch logic is provided, we stop here
        if (!field.fetchOptions) continue

        setLoadingMap(prev => ({ ...prev, [fieldKey]: true }))

        try {
          const data = await field.fetchOptions(parentValue)
          if (!isMounted) return

          const mapped = field.mapOptions ? field.mapOptions(data) : data
          setOptionsMap(prev => ({ ...prev, [fieldKey]: mapped }))
        } catch {
          if (isMounted) setOptionsMap(prev => ({ ...prev, [fieldKey]: [] }))
        } finally {
          if (isMounted) setLoadingMap(prev => ({ ...prev, [fieldKey]: false }))
        }
      }
    }

    runDependencies()

    return () => {
      isMounted = false
    }
  }, [values, formConfig, isEmptyValue])

  // ✅ VALIDATION
  const validateRequired = (isEmpty: boolean, keyStr: string) =>
    isEmpty ? { errorkey: keyStr, error: 'This field is required' } : null

  const validateNumber = (value: any, isEmpty: boolean, keyStr: string) =>
    !isEmpty && Number.isNaN(Number(value)) ? { errorkey: keyStr, error: 'Must be a number' } : null

  const validateEmail = (value: any, isEmpty: boolean, keyStr: string) =>
    !isEmpty && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? { errorkey: keyStr, error: 'Invalid email' } : null

  const validateMobile = (value: any, isEmpty: boolean, keyStr: string) => {
    if (isEmpty) return null
    const val = String(value).trim()
    if (val.length != 10) return { errorkey: keyStr, error: 'Mobile number must be 10 digits' }

    return null
  }

  const validatePincode = (value: any, isEmpty: boolean, keyStr: string) => {
    if (isEmpty) return null
    if (!/^\d{6}$/.test(String(value))) return { errorkey: keyStr, error: 'Pincode must be 6 digits' }

    return null
  }

  const validateAadhar = (value: any, isEmpty: boolean, keyStr: string) => {
    if (isEmpty) return null
    const val = String(value).trim()
    if (val.length !== 12) return { errorkey: keyStr, error: 'Aadhar must be 12 digits' }

    return null
  }

  const validateLength = (rule: any, value: any, keyStr: string) => {
    if (rule.type === 'minLength' && value?.length < rule.value) {
      return { errorkey: keyStr, error: rule.message || `Minimum ${rule.value} characters required` }
    }
    if (rule.type === 'maxLength' && value?.length > rule.value) {
      return { errorkey: keyStr, error: rule.message || `Maximum ${rule.value} characters allowed` }
    }

    return null
  }

  const ruleHandlers: Record<string, RuleHandler> = {
    required: (_, isEmpty, keyStr) => validateRequired(isEmpty, keyStr),
    number: (value, isEmpty, keyStr) => validateNumber(value, isEmpty, keyStr),
    email: (value, isEmpty, keyStr) => validateEmail(value, isEmpty, keyStr),
    mobile: (value, isEmpty, keyStr) => validateMobile(value, isEmpty, keyStr),
    pincode: (value, isEmpty, keyStr) => validatePincode(value, isEmpty, keyStr),
    aadhar: (value, isEmpty, keyStr) => validateAadhar(value, isEmpty, keyStr)
  }

  const validateField = (key: keyof T, value: any) => {
    const field = formConfig.find(f => f.key === key)
    if (!field?.rules) return null

    const keyStr = String(key)
    const isEmpty = isEmptyValue(value)

    for (const rule of field.rules) {
      let error: ValidationError = null

      if (typeof rule == 'number' || typeof rule === 'string') {
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
  const updateErrors = useCallback(
    (key: keyof T, value: any) => {
      const keyStr = String(key)
      const error = validateField(key, value)
      setErrors(prev => {
        const filtered = prev.filter(e => e.errorkey !== keyStr)

        return error ? [...filtered, error] : filtered
      })
    },
    [formConfig]
  )

  const handleChange = useCallback(
    (key: keyof T) => (input: any) => {
      const value = getValue(input)
      const normalizedValue = value instanceof Date ? dateToString(value, 'yyyy-MM-dd') : value

      updateErrors(key, value)
      setValues(prev => ({ ...prev, [key]: normalizedValue }))
    },
    [updateErrors]
  )

  const generatedFields = useMemo(
    () =>
      mapToFields({
        config: formConfig,
        values,
        handleChange,
        optionsMap,
        loadingMap
      }),
    [formConfig, values, handleChange, optionsMap, loadingMap]
  )

  // ✅ FORM VALIDATION
  const validateForm = () => {
    const newErrors: ErrorObject[] = []

    formConfig.forEach(field => {
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

    const processedValues = { ...values } as Record<string, any>

    Object.keys(processedValues).forEach(key => {
      const val = processedValues[key]

      if (typeof val === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
        const [day, month, year] = val.split('/')
        processedValues[key] = `${year}-${month}-${day}`
      } else if (val instanceof Date) {
        processedValues[key] = dateToString(val, 'yyyy-MM-dd')
      }
    })

    onSubmit(processedValues as T)
  }

  return {
    values,
    errors,
    optionsMap,
    loadingMap,
    fields: generatedFields,
    handleChange,
    handleSubmit,
    setValues,
    setOptionsMap,
    shouldDisableSubmit:
      errors.length > 0 || formConfig.some(f => f.rules?.includes('required') && isEmptyValue(values[f.key]))
  }
}
