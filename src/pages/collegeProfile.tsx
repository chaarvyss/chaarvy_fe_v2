import React, { ChangeEvent, useEffect, useState } from 'react'
import { Box, Grid, TextField } from '@muiElements'
import { CollegeDetailResponse, useGetCollegeDetailsQuery } from 'src/store/services/viewServices'
import { Button, Paper, SelectChangeEvent, Typography } from '@mui/material'
import { InputVariants } from 'src/lib/enums'
import StyledImage from 'src/reusable_components/styledImage'
import { useUpdateCollegeProfileMutation, useUploadCollegeLogoMutation } from 'src/store/services/adminServices'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useSettings } from 'src/@core/hooks/useSettings'

const ViewProfile = () => {
  const { data: details } = useGetCollegeDetailsQuery()
  const [newDetails, setNewDetails] = useState<CollegeDetailResponse>()
  const [collegeLogo, setCollegeLogo] = useState<File>()
  const [collegeLogoUrl, setCollegeLogoUrl] = useState<string>()

  const { settings, saveSettings } = useSettings()

  const [UpdateCollegeProfileDetails] = useUpdateCollegeProfileMutation()
  const [uploadCollegeLogo] = useUploadCollegeLogoMutation()

  const { triggerToast } = useToast()

  useEffect(() => {
    if (details) {
      setNewDetails(details)
      setCollegeLogoUrl(details.college_logo ?? undefined)
    }
  }, [details])

  const handleChange =
    (prop: keyof CollegeDetailResponse) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) =>
      setNewDetails(prev => ({ ...prev, [prop]: event?.target?.value ?? event }))

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCollegeLogo(file)
      setCollegeLogoUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadCollegeLogo = () => {
    if (collegeLogo) {
      uploadCollegeLogo(collegeLogo)
        .unwrap()
        .then(res => {
          saveSettings({ ...settings, college_logo: collegeLogoUrl })
          setCollegeLogo(undefined)
          triggerToast(res, { variants: ToastVariants.SUCCESS })
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  const handleSubmit = () => {
    if (newDetails) {
      UpdateCollegeProfileDetails(newDetails)
        .unwrap()
        .then(res => {
          saveSettings({
            ...settings,
            campus_name: newDetails.campus_name ?? '',
            college_name: newDetails.college_name ?? ''
          })
          triggerToast(res, { variant: ToastVariants.SUCCESS })
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  return (
    <Paper sx={{ p: 5 }}>
      <Typography variant='h4' marginBottom='1rem' textAlign='center'>
        College Profile
      </Typography>
      <Box className='d-flex flex-column flex-md-row'>
        <Grid container spacing={7}>
          {['college_code', 'college_name', 'campus_name', 'contact_numbers'].map(field => (
            <Grid item xs={12} key={field}>
              <Box display='flex' flexDirection='column'>
                <small>{field.replace('_', ' ').toUpperCase()}</small>
                <TextField
                  onChange={handleChange(field as keyof CollegeDetailResponse)}
                  value={newDetails?.[field as keyof CollegeDetailResponse]}
                  disabled={field === 'college_code'}
                  type={field === 'contact_numbers' ? InputVariants.NUMBER : 'text'}
                />
              </Box>
            </Grid>
          ))}
          {newDetails !== details && (
            <Grid item>
              <Button onClick={handleSubmit}>Update Profile</Button>
            </Grid>
          )}
        </Grid>
        <Grid container spacing={7}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <StyledImage src={collegeLogoUrl ?? '/images/avatars/1.png'} alt='add photo' />
              <Button component='label' variant='contained' htmlFor='upload-image'>
                {`${collegeLogoUrl ? 'Update' : 'Upload'} College logo`}
                <input
                  hidden
                  type='file'
                  onChange={handleImageUpload}
                  accept='image/png, image/jpeg'
                  id='upload-image'
                />
              </Button>
              {collegeLogo && <Button onClick={handleUploadCollegeLogo}>Save Logo</Button>}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default ViewProfile
