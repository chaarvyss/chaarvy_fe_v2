import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  IconButton
} from '@mui/material'
import { Fragment, useEffect, useState, useRef } from 'react'
import DatePicker from 'react-datepicker'

import { FormControl, Grid, TextField } from '@muiElements'
import { InputTypes } from 'src/lib/enums'
import { ErrorObject, InputFields } from 'src/lib/types'
import GetChaarvyIcons from 'src/utils/icons'

import CustomDateElement from './dateInputElement'
import OverlaySpinner from './overlaySpinner'

const ADD_NEW_OPTION_VALUE = '__chaarvy_add_new_option__'

const SelectInputField = ({
  field,
  mandatoryFields,
  errorObj
}: {
  field: InputFields
  mandatoryFields: string[]
  errorObj?: ErrorObject
}) => {
  const {
    id,
    label,
    key,
    value,
    onChange,
    isDisabled,
    menuOptions = [],
    isLoading,
    searchable,
    onSearch,
    onAddNew,
    addNewLabel,
    onEdit,
    onEditSuccess,
    isOptionsLoading = false,
    isUpdating
  } = field as any

  const [inputValue, setInputValue] = useState('')
  const [editingOption, setEditingOption] = useState<string | number | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [fetchedOptions, setFetchedOptions] = useState<{ label: string; value: any }[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Local lock guarantees the spinner shows INSTANTLY on click,
  // bridging the gap until the parent's API state catches up.
  const [localIsUpdating, setLocalIsUpdating] = useState(false)

  const isCurrentlyUpdating = isUpdating === true || localIsUpdating

  // --- STRICT AUTO-RESET: Only close when parent's isUpdating finishes ---
  const prevUpdating = useRef(isUpdating)
  useEffect(() => {
    // If parent state goes from TRUE -> FALSE, the API call is done. Close the editor.
    if (prevUpdating.current === true && isUpdating === false) {
      setEditingOption(null)
      setEditLabel('')
      setLocalIsUpdating(false)
      onEditSuccess?.()
    }
    prevUpdating.current = isUpdating
  }, [isUpdating, onEditSuccess])

  useEffect(() => {
    if (!searchable || !onSearch) {
      return
    }

    const fetchSearchData = async () => {
      setIsFetching(true)
      try {
        const results = await onSearch(inputValue)
        setFetchedOptions(results || [])
      } catch (e) {
        console.error('Error fetching search options', e)
      } finally {
        setIsFetching(false)
      }
    }

    const timer = setTimeout(() => {
      if (inputValue) {
        fetchSearchData()
      } else {
        setFetchedOptions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, searchable, onSearch])

  // Combine original options with fetched options, removing exact duplicates
  const combinedOptions = [...menuOptions]
  fetchedOptions.forEach(fetchedOpt => {
    if (!combinedOptions.find(opt => opt.value === fetchedOpt.value)) {
      combinedOptions.push(fetchedOpt)
    }
  })

  let addNewOptionLabel = ''
  if (addNewLabel) {
    if (inputValue.trim()) {
      addNewOptionLabel = `${addNewLabel}: "${inputValue.trim()}"`
    } else {
      addNewOptionLabel = addNewLabel
    }
  }

  let customAddOption: { label: string; value: string } | null = null
  if (onAddNew && addNewLabel && inputValue.trim()) {
    customAddOption = { label: addNewOptionLabel, value: ADD_NEW_OPTION_VALUE }
  }
  const noOptionsText = onAddNew ? (inputValue.trim() ? `Add "${inputValue.trim()}"` : 'Type to search') : 'No options'

  const filterOptions = (options: any[], state: any) => {
    const inputValue = state.inputValue.trim().toLowerCase()

    const filtered = options.filter(option => {
      return typeof option.label === 'string' && option.label.toLowerCase().includes(state.inputValue.toLowerCase())
    })

    const isDuplicate = options.some(option => option.label.toLowerCase() === inputValue)

    if (customAddOption && editingOption === null && inputValue !== '' && !isDuplicate) {
      return [...filtered, customAddOption]
    }

    return filtered
  }

  if (searchable) {
    return (
      <FormControl fullWidth required={mandatoryFields.includes(key)}>
        <small>
          {label} {mandatoryFields.includes(key) ? <span style={{ color: 'red' }}>*</span> : ''}
        </small>
        <Autocomplete
          id={id}
          disabled={isDisabled}
          options={combinedOptions}
          filterOptions={filterOptions}
          freeSolo={!!onAddNew}
          openOnFocus
          disableCloseOnSelect={!!onEdit || editingOption !== null}
          clearOnBlur={false}
          open={isOpen || editingOption !== null}
          onOpen={() => setIsOpen(true)}
          onClose={() => {
            if (editingOption !== null) {
              return
            }
            setIsOpen(false)
            setEditingOption(null)
            setEditLabel('')
          }}
          getOptionDisabled={option => {
            return editingOption !== null && option.value !== editingOption
          }}
          slotProps={{
            paper: {
              onMouseDown: (e: any) => {
                if (editingOption !== null) {
                  e.preventDefault()
                }
              }
            }
          }}
          isOptionEqualToValue={(option, val) => {
            if (typeof option === 'string' || typeof val === 'string') {
              return option === val
            }

            return option.value === val.value
          }}
          getOptionLabel={option => (typeof option === 'string' ? option : option.label || '')}
          loadingText={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1 }}>
              <CircularProgress size={16} />
              <span>Loading options...</span>
            </Box>
          }
          loading={isLoading || isFetching || isOptionsLoading}
          value={combinedOptions.find(opt => opt.value === value || String(opt.value) === String(value)) || null}
          onChange={(_, newValue) => {
            if (editingOption !== null) {
              return
            }

            if (!newValue) {
              onChange?.({ target: { value: '' } } as any)
              setInputValue('')

              return
            }

            if (typeof newValue === 'string') {
              onAddNew?.(newValue.trim() || undefined)
              setInputValue('')

              return
            }

            if (newValue.value === ADD_NEW_OPTION_VALUE) {
              onAddNew?.(inputValue.trim() || undefined)
              setInputValue('')

              return
            }

            const selectedValue = newValue.value
            const selectedLabel = newValue.label || ''

            if (onChange) {
              onChange({ target: { value: selectedValue } } as any)
            }

            setInputValue(selectedLabel)
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue)
          }}
          size='small'
          noOptionsText={noOptionsText}
          renderOption={(props, option) => {
            if (option.value === ADD_NEW_OPTION_VALUE) {
              return editingOption !== null ? null : (
                <li {...props} key={option.value}>
                  {option.label}
                </li>
              )
            }

            const isEditing = editingOption === option.value
            const hasChanges = editLabel.trim() && editLabel !== option.label

            const shouldDisableEditIcon = editingOption !== null && editingOption !== option.value

            return (
              <li {...props} key={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  {isEditing ? (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}
                      onClick={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <TextField
                        autoFocus
                        fullWidth
                        size='small'
                        value={editLabel}
                        disabled={isCurrentlyUpdating}
                        onChange={e => setEditLabel(e.target.value)}
                        onKeyDown={async e => {
                          if (isCurrentlyUpdating) return
                          e.stopPropagation()

                          if (e.key === 'Enter' && hasChanges) {
                            setLocalIsUpdating(true) // 1. Force spinner instantly
                            try {
                              await onEdit?.(option.value, editLabel.trim())
                            } catch (err) {
                              console.error(err)
                            } finally {
                              if (isUpdating === undefined) {
                                // 2a. If parent isn't tracking state, close manually
                                setEditingOption(null)
                                setEditLabel('')
                                setLocalIsUpdating(false)
                                onEditSuccess?.()
                              } else {
                                // 2b. If parent is tracking, drop local lock after 600ms
                                //     to give parent time to set isUpdating = true
                                setTimeout(() => setLocalIsUpdating(false), 600)
                              }
                            }
                          } else if (e.key === 'Escape') {
                            setEditingOption(null)
                            setEditLabel('')
                          }
                        }}
                        onMouseDown={e => e.stopPropagation()}
                      />

                      {isCurrentlyUpdating ? (
                        <IconButton size='small' disabled>
                          <CircularProgress size={20} />
                        </IconButton>
                      ) : (
                        <IconButton
                          size='small'
                          disabled={!hasChanges}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={async e => {
                            e.stopPropagation()
                            if (hasChanges) {
                              setLocalIsUpdating(true) // 1. Force spinner instantly
                              try {
                                await onEdit?.(option.value, editLabel.trim())
                              } catch (err) {
                                console.error(err)
                              } finally {
                                if (isUpdating === undefined) {
                                  // 2a. If parent isn't tracking state, close manually
                                  setEditingOption(null)
                                  setEditLabel('')
                                  setLocalIsUpdating(false)
                                  onEditSuccess?.()
                                } else {
                                  // 2b. If parent is tracking, drop local lock after 600ms
                                  //     to give parent time to set isUpdating = true
                                  setTimeout(() => setLocalIsUpdating(false), 600)
                                }
                              }
                            } else {
                              setEditingOption(null)
                              setEditLabel('')
                            }
                          }}
                        >
                          <GetChaarvyIcons iconName='Check' color='success' fontSize='1.25rem' />
                        </IconButton>
                      )}

                      <IconButton
                        size='small'
                        disabled={isCurrentlyUpdating}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => {
                          e.stopPropagation()
                          setEditingOption(null)
                          setEditLabel('')
                        }}
                      >
                        <GetChaarvyIcons iconName='Close' color='error' fontSize='1.25rem' />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{option.label}</span>
                      {onEdit && !isOptionsLoading ? (
                        <IconButton
                          size='small'
                          disabled={shouldDisableEditIcon}
                          onMouseDown={e => {
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                          onClick={e => {
                            e.stopPropagation()
                            setEditingOption(option.value)
                            setEditLabel(option.label)
                          }}
                        >
                          <GetChaarvyIcons
                            iconName='Pencil'
                            color={shouldDisableEditIcon ? 'secondary' : 'primary'}
                            fontSize='1.25rem'
                          />
                        </IconButton>
                      ) : null}
                    </Box>
                  )}
                </Box>
              </li>
            )
          }}
          renderInput={params => (
            <TextField
              {...params}
              error={!!errorObj}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <Fragment>
                    {/* Maintain inline fetching spinner as well */}
                    {isLoading || isFetching ? <CircularProgress color='inherit' size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </Fragment>
                )
              }}
            />
          )}
        />
        {errorObj && <small style={{ color: 'red' }}>{errorObj.error}</small>}
      </FormControl>
    )
  }

  return (
    <FormControl fullWidth required={mandatoryFields.includes(key)}>
      <small>
        {label} {mandatoryFields.includes(key) ? <span style={{ color: 'red' }}>*</span> : ''}
      </small>
      <Select size='small' id={id} value={value ?? ''} onChange={onChange} disabled={isDisabled} error={!!errorObj}>
        {isLoading ? (
          <MenuItem disabled>
            <CircularProgress size={24} />
          </MenuItem>
        ) : (
          menuOptions.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))
        )}
      </Select>
      {errorObj && <small style={{ color: 'red' }}>{errorObj.error}</small>}
    </FormControl>
  )
}

interface FormGeneratorProps {
  fields: InputFields[]
  mandatoryFields?: Array<string>
  errors?: Array<ErrorObject>
  gridSpacing?: number
  columnSize?: { xs?: number; sm?: number; md?: number; lg?: number }
  isLoading?: boolean
}

const FormGenerator = ({
  fields,
  mandatoryFields = [],
  errors = [],
  gridSpacing = 7,
  columnSize = { xs: 12, sm: 6 },
  isLoading = false
}: FormGeneratorProps) => {
  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  if (isLoading) return <OverlaySpinner />

  return (
    <Grid container spacing={gridSpacing}>
      {fields.map(
        ({
          type,
          id,
          customInput,
          isDisabled,
          label,
          placeholder,
          onChange,
          key,
          caption,
          value,
          variant,
          menuOptions,
          showYearDropdown,
          showMonthDropdown,
          onSearch,
          searchable,
          addNewLabel,
          onAddNew,
          onEdit,
          onEditSuccess,
          isOptionsLoading,
          isUpdating
        }) => (
          <Grid item {...columnSize} key={id}>
            {type === InputTypes.INPUT ? (
              <>
                <small>
                  {label} {mandatoryFields.includes(key) ? <span style={{ color: 'red' }}>*</span> : ''}
                </small>
                <TextField
                  fullWidth
                  id={id}
                  size='small'
                  error={!!getHadError(key)}
                  value={value ?? ''}
                  defaultValue={value}
                  type={variant}
                  disabled={isDisabled}
                  placeholder={placeholder ?? ''}
                  onChange={onChange}
                />
                {caption && <small>{caption}</small>}
                {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
              </>
            ) : type === InputTypes.SELECT ? (
              <SelectInputField
                field={{
                  type,
                  id,
                  customInput,
                  isDisabled,
                  label,
                  placeholder,
                  onChange,
                  isLoading,
                  key,
                  caption,
                  value,
                  variant,
                  menuOptions,
                  showYearDropdown,
                  showMonthDropdown,
                  searchable,
                  onSearch,
                  onAddNew,
                  addNewLabel,
                  onEdit,
                  onEditSuccess,
                  isOptionsLoading,
                  isUpdating
                }}
                mandatoryFields={mandatoryFields}
                errorObj={getHadError(key)}
              />
            ) : type === InputTypes.RADIO ? (
              <FormControl required={mandatoryFields.includes(key)} error={!!getHadError(key)} fullWidth>
                <FormLabel id={id}>
                  {label} {mandatoryFields.includes(key) ? <span style={{ color: 'red' }}>*</span> : ''}
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby={id}
                  name={id}
                  id={id}
                  value={value ?? ''}
                  onChange={(_, val) => onChange({ target: { value: val } } as any)}
                >
                  {(menuOptions ?? []).map(each => (
                    <FormControlLabel key={each.value} value={each.value} control={<Radio />} label={each.label} />
                  ))}
                </RadioGroup>
                {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
              </FormControl>
            ) : type === InputTypes.DATE ? (
              <Box display='flex' flexDirection='column'>
                <small>
                  {label} {mandatoryFields.includes(key) ? <span style={{ color: 'red' }}>*</span> : ''}
                </small>
                <DatePicker
                  selected={value as Date}
                  required={mandatoryFields.includes(key)}
                  customInput={customInput ?? <CustomDateElement label='' />}
                  id={id}
                  onChange={onChange}
                  disabled={isDisabled}
                  showYearDropdown={showYearDropdown}
                  showMonthDropdown={showMonthDropdown}
                />
                {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
              </Box>
            ) : type === InputTypes.DATE_RANGE ? (
              <Box display='flex' flexDirection='column'>
                <small>{label}</small>

                <DatePicker
                  selectsRange
                  startDate={value?.[0] || null}
                  endDate={value?.[1] || null}
                  onChange={(dates: [Date | null, Date | null]) => onChange(dates)}
                  customInput={<CustomDateElement label='' />}
                  isClearable
                />

                {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
              </Box>
            ) : type === InputTypes.BUTTON ? (
              <FormControl fullWidth>
                <small style={{ color: 'transparent' }}>.</small>
                <Box display='flex' alignItems='end'>
                  <Button color='success' disabled={isDisabled} variant='contained' onClick={onChange} size='small'>
                    {label}
                  </Button>
                </Box>
              </FormControl>
            ) : type === InputTypes.CHECKBOX ? (
              <FormControl fullWidth>
                <FormControlLabel
                  control={<Checkbox id={id} checked={value as boolean} onChange={onChange} disabled={isDisabled} />}
                  label={
                    <>
                      {label} {mandatoryFields.includes(key) ? <span style={{ color: 'red' }}>*</span> : ''}
                    </>
                  }
                />
                {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
              </FormControl>
            ) : null}
          </Grid>
        )
      )}
    </Grid>
  )
}

export default FormGenerator
