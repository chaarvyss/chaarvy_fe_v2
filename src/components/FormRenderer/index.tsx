import { CircularProgress, MenuItem, Select } from '@mui/material'

import { FormControl, Grid, TextField } from '@muiElements'
import { InputTypes } from 'src/lib/enums'
import { ErrorObject, InputFields } from 'src/lib/types'

interface FormRendererProps {
  fields: InputFields[]
  errors: ErrorObject[]
  mandatoryFields: string[]
}

const FormRenderer = ({ fields, errors, mandatoryFields = [] }: FormRendererProps) => {
  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  return fields.map(
    ({ type, id, label, placeholder, onChange, key, caption, isLoading, value, variant, menuOptions }) => (
      <Grid item xs={12} sm={6} key={id}>
        {type === InputTypes.INPUT ? (
          <>
            <small>
              {label} <span style={{ color: 'red' }}>{mandatoryFields.includes(key) ? '*' : ''}</span>
            </small>
            <TextField
              fullWidth
              id={id}
              type={variant}
              error={!!getHadError(key)}
              value={value}
              placeholder={placeholder ?? ''}
              onChange={onChange}
            />
            {caption && <small>{caption}</small>}
            {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
          </>
        ) : type === InputTypes.SELECT ? (
          <FormControl fullWidth required={mandatoryFields.includes(key)}>
            <small>
              {label} <span style={{ color: 'red' }}>{mandatoryFields.includes(key) ? '*' : ''}</span>
            </small>
            <Select id={id} value={value ?? ''} onChange={onChange} error={!!getHadError(key)}>
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
        ) : null}
      </Grid>
    )
  )
}

export default FormRenderer
