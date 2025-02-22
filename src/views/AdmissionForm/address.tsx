import {
  Box,
  CardContent,
  Divider,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  styled,
  Typography
} from '@mui/material'
import React, { ChangeEvent, forwardRef, useState } from 'react'
import DatePicker from 'react-datepicker'

import { Button, FormControl, Grid, InputLabel, TextField } from '@muiElements'

import 'react-datepicker/dist/react-datepicker.css'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { useGetQualifiedExamsListQuery } from 'src/store/services/listServices'
import { Address, CreateStudentAdmissionRequest } from 'src/store/services/admisissionsService'

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const TOP_LEVEL_ID = 'student-address'

const StudentAddress = () => {
  const [studentAddress, setStudentAddress] = useState<Address>()

  const handleAddressChange =
    (prop: keyof Address) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setStudentAddress({ ...studentAddress, [prop]: event.target.value })
    }

  return (
    <DatePickerWrapper>
      <CardContent>
        <form>
          <Grid container spacing={7}>
            <Divider />
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Plot/Door number'
                id={`${TOP_LEVEL_ID}__door-no`}
                value={studentAddress?.door_no}
                onChange={handleAddressChange('door_no')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='House / Apartment name'
                id={`${TOP_LEVEL_ID}__house-apartment-name`}
                value={studentAddress?.house_apartment_name}
                onChange={handleAddressChange('house_apartment_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Street'
                id={`${TOP_LEVEL_ID}__street`}
                value={studentAddress?.street}
                onChange={handleAddressChange('street')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Village/town/city'
                id={`${TOP_LEVEL_ID}__village-name`}
                value={studentAddress?.village_city}
                onChange={handleAddressChange('village_city')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  label='State'
                  id={`${TOP_LEVEL_ID}__state`}
                  value={studentAddress?.state}
                  onChange={handleAddressChange('state')}
                >
                  <MenuItem value='active'>BC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>District</InputLabel>
                <Select
                  label='District'
                  id={`${TOP_LEVEL_ID}__district`}
                  value={studentAddress?.district}
                  onChange={handleAddressChange('district')}
                >
                  <MenuItem value='active'>BC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Pincode'
                type='number'
                id={`${TOP_LEVEL_ID}_pincode`}
                value={studentAddress?.pincode}
                onChange={handleAddressChange('pincode')}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => console.log(studentAddress, 'raja')}>
                Save Changes
              </Button>
              <Button type='reset' variant='outlined' color='secondary'>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </DatePickerWrapper>
  )
}

export default StudentAddress
