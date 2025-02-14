import { Box, CardContent, Divider, MenuItem, Select, styled, Typography } from '@mui/material'
import { Button, FormControl, Grid, InputLabel, TextField } from '@muiElements'
import React, { forwardRef, useState } from 'react'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const StudentBaseDetails = () => {
  const [studentImg, setStudentImg] = useState(null)

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'end' }}>
              <ImgStyled src={studentImg ?? '/images/avatars/1.png'} alt='add photo' />
              <Box>
                <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                  Upload New Photo
                  <input
                    hidden
                    type='file'
                    onChange={() => {}}
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </Button>

                <Typography variant='body2' sx={{ marginTop: 5 }}>
                  Allowed PNG or JPEG. Max size of 800K.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Student Name' placeholder='student name' />
            <small>As per SSC Records</small>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Qualified Exam</InputLabel>
              <Select label='Qualified Exam'>
                <MenuItem value='SSC'>SSC/INTER</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Hall ticket number' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Year of pass</InputLabel>
              <Select label='Year of pass'>
                <MenuItem value='SSC'>SSC/INTER</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Group</InputLabel>
              <Select label='Group'>
                <MenuItem value='active'>BC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Medium</InputLabel>
              <Select label='Medium'>
                <MenuItem value='active'>BC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Second Language</InputLabel>
              <Select label='Second Language'>
                <MenuItem value='active'>BC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type='date' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Father Name' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Father Occupation</InputLabel>
              <Select label='Father Occupation'>
                <MenuItem value='admin'>Daily wage Labor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Mother Name' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Mother Occupation</InputLabel>
              <Select label='Mother Occupation'>
                <MenuItem value='admin'>Daily wage Labor</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel>Gender</InputLabel>
            <Box marginTop={2} display='flex' gap={2}>
              <Box gap={1}>
                <input type='radio' id='male' />
                <label htmlFor='male'>Male</label>
              </Box>
              <Box gap={1}>
                <input type='radio' id='female' />
                <label htmlFor='female'>Female</label>
              </Box>
              <Box gap={1}>
                <input type='radio' id='transgender' />
                <label htmlFor='transgender'>Transgender</label>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type='email' label='Student Email' placeholder='johnDoe@example.com' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type='number' label='Phone' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type='number' label='Student Aadhaar' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type='number' label='Father Aadhaar' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type='number' label='Mother Aadhaar' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Religion</InputLabel>
              <Select label='Religion' defaultValue='active'>
                <MenuItem value='hindu'>Hindu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Caste</InputLabel>
              <Select label='Caste'>
                <MenuItem value='active'>BC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='subcaste' />
          </Grid>

          <Divider />
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Plot/Door number' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Apartment name' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Street' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Village/town/city' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select label='State'>
                <MenuItem value='active'>BC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>District</InputLabel>
              <Select label='District'>
                <MenuItem value='active'>BC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label='Pincode' type='number' />
          </Grid>

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default StudentBaseDetails
