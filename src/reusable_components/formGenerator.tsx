import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select
} from '@mui/material'
import React from 'react'
import DatePicker from 'react-datepicker'

import { FormControl, Grid, TextField } from '@muiElements'
import { InputTypes } from 'src/lib/enums'
import { ErrorObject, InputFields } from 'src/lib/types'

import CustomDateElement from './dateInputElement'
import OverlaySpinner from './overlaySpinner'

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
          isLoading,
          showYearDropdown,
          showMonthDropdown
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
              <FormControl fullWidth required={mandatoryFields.includes(key)}>
                <small>
                  {label} {mandatoryFields.includes(key) ? <span style={{ color: 'red' }}>*</span> : ''}
                </small>
                <Select
                  id={id}
                  value={value ?? ''}
                  onChange={onChange}
                  disabled={isDisabled}
                  error={!!getHadError(key)}
                >
                  {isLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : (
                    (menuOptions ?? []).map(({ value, label }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
              </FormControl>
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
                  customInput={customInput}
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
                  <Button color='success' disabled={isDisabled} variant='contained' onClick={onChange}>
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
