import { Box, Button, CircularProgress, MenuItem, Select } from '@mui/material'

import { FormControl, Grid, TextField } from '@muiElements'
import { InputTypes } from 'src/lib/enums'
import { ErrorObject, InputFields } from 'src/lib/types'

interface RenderInputFieldsProps {
  fields: InputFields[]
  mandatoryFields: Array<string>
  errors: Array<ErrorObject>
}

const RenderInputFields = ({ fields, mandatoryFields, errors }: RenderInputFieldsProps) => {
  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  return (
    <Grid container spacing={3}>
      {fields.map(
        ({
          type,
          id,
          isDisabled,
          label,
          placeholder,
          onChange,
          key,
          caption,
          value,
          variant,
          menuOptions,
          isLoading
        }) => (
          <Grid item xs={12} sm={6} key={id}>
            {type === InputTypes.INPUT ? (
              <>
                <small>
                  {label} {mandatoryFields.includes(key) ? '*' : ''}
                </small>
                <TextField
                  fullWidth
                  id={id}
                  size='small'
                  error={!!getHadError(key)}
                  value={value}
                  defaultValue={value}
                  type={variant}
                  placeholder={placeholder ?? ''}
                  onChange={onChange}
                />
                {caption && <small>{caption}</small>}
                {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
              </>
            ) : type === InputTypes.SELECT ? (
              <FormControl fullWidth required={mandatoryFields.includes(key)}>
                <small>{label}</small>
                <Select id={id} value={value ?? ''} size='small' onChange={onChange} error={!!getHadError(key)}>
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
            ) : type === InputTypes.BUTTON ? (
              <FormControl fullWidth>
                <small color='#fff'>.</small>
                <Box display='flex' alignItems='end'>
                  <Button color='success' disabled={isDisabled} variant='contained' onClick={onChange}>
                    {label}
                  </Button>
                </Box>
              </FormControl>
            ) : null}
          </Grid>
        )
      )}
    </Grid>
  )
}

export default RenderInputFields
