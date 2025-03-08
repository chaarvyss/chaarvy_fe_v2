import { Box, FormControlLabel, FormLabel, MenuItem, Radio, RadioGroup, Select } from '@mui/material'
import { FormControl, Grid, TextField } from '@muiElements'
import React, { ChangeEvent, useState } from 'react'
import DatePicker from 'react-datepicker'
import { InputTypes } from 'src/lib/enums'
import { ErrorObject, InputFields } from 'src/lib/types'

interface FormGeneratorProps {
  fields: InputFields[]
  mandatoryFields: Array<string>
}

const FormGenerator = ({ fields, mandatoryFields }: FormGeneratorProps) => {
  const [errors, setErrors] = useState<Array<ErrorObject>>([])

  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  const renderInputFields = () =>
    fields.map(({ type, id, customInput, label, placeholder, onChange, key, caption, value, variant, menuOptions }) => (
      <Grid item xs={12} sm={6} key={id}>
        {type === InputTypes.INPUT ? (
          <>
            <small>
              {label} {mandatoryFields.includes(key) ? '*' : ''}
            </small>
            <TextField
              fullWidth
              id={id}
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
            <Select id={id} value={value ?? ''} onChange={onChange} error={!!getHadError(key)}>
              {(menuOptions ?? []).map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
          </FormControl>
        ) : // type === InputTypes.RADIO ? (
        //   <Grid item xs={12}>
        //     <FormControl required error={!!getHadError(key)}>
        //       <FormLabel id={id}>{label}</FormLabel>
        //       <RadioGroup
        //         row
        //         aria-labelledby={id}
        //         name={id}
        //         id={id}
        //         value={value ?? ''}
        //         onChange={(_, val) =>
        //           handleChange(key as keyof CreateStudentAdmissionRequest)({
        //             target: { value: val }
        //           } as ChangeEvent<HTMLInputElement>)
        //         }
        //       >
        //         {(menuOptions ?? []).map(each => (
        //           <FormControlLabel value={each.value} control={<Radio />} label={each.label} />
        //         ))}
        //       </RadioGroup>
        //       {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
        //     </FormControl>
        //   </Grid>
        // ) : type === InputTypes.DATE ? (
        //   <Grid item xs={12}>
        //     <Box display='flex' flexDirection='column'>
        //       <small>Date of Birth</small>
        //       <DatePicker
        //         selected={dob}
        //         required={mandatoryFields.includes(key)}
        //         customInput={customInput}
        //         id={id}
        //         onChange={onChange}
        //       />
        //       {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
        //     </Box>
        //   </Grid>
        // ) :
        null}
      </Grid>
    ))
}

export default FormGenerator
