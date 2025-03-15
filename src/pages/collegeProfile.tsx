import React, { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'
import { Box, Grid, TextField } from '@muiElements'
import { CollegeDetailResponse, useGetCollegeDetailsQuery } from 'src/store/services/viewServices'
import { Button, IconButton, Paper, SelectChangeEvent, Tab, Typography } from '@mui/material'
import { InputVariants } from 'src/lib/enums'
import StyledImage from 'src/reusable_components/styledImage'
import { useUpdateCollegeProfileMutation, useUploadCollegeLogoMutation } from 'src/store/services/adminServices'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import GetChaarvyIcons from 'src/utils/icons'
import AddressForm, { AddressType } from 'src/common/addressForm'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { TabName } from 'src/reusable_components/styledComponents/TabName'

enum FormType {
  BASE_DETAIL = 'base_detail',
  ADDRESS = 'address'
}

const ViewCollegeProfile = () => {
  const { data: details } = useGetCollegeDetailsQuery()
  const [newDetails, setNewDetails] = useState<CollegeDetailResponse>()
  const [collegeLogo, setCollegeLogo] = useState<File>()
  const [collegeLogoUrl, setCollegeLogoUrl] = useState<string>()

  const { settings, saveSettings } = useSettings()

  const [value, setValue] = useState<FormType>(FormType.BASE_DETAIL)

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

  const BaseDetailsTab = () => (
    <Grid container spacing={7}>
      {['college_code', 'college_name', 'campus_name', 'contact_numbers'].map(field => (
        <Grid item xs={12} md={6} key={field}>
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
  )

  const handleTabChange = (_: SyntheticEvent, newValue: FormType) => setValue(newValue)

  const tabs = [
    {
      value: FormType.BASE_DETAIL,
      label: 'College Details',
      icon: <GetChaarvyIcons iconName='AccountDetails' />,
      component: BaseDetailsTab()
    },
    {
      value: FormType.ADDRESS,
      label: 'Address',
      icon: <GetChaarvyIcons iconName='MapMarkerOutline' />,
      component: <AddressForm user_type={AddressType.COLLEGE} address_id={details?.address_id} />
    }
  ]

  return (
    <Paper sx={{ p: 5 }}>
      <Typography variant='h5' marginBottom='1rem' textAlign='left'>
        College Profile
      </Typography>
      <Box className='d-flex flex-column flex-md-row justify-content-center align-items-start' gap={4}>
        <Box
          className='border col-12 col-md-4 d-flex flex-column justify-content-center align-items-center rounded'
          gap={4}
          padding={4}
        >
          <Box className='position-relative'>
            <StyledImage variant='rounded' src={collegeLogoUrl ?? '/images/avatars/1.png'} alt='add photo' />
            <IconButton
              component='label'
              color='info'
              htmlFor='upload-image'
              className='position-absolute bg-info'
              sx={{ bottom: '0px', right: '20px' }}
            >
              <GetChaarvyIcons iconName='PencilOutline' color='white' />
              <input hidden type='file' onChange={handleImageUpload} accept='image/png, image/jpeg' id='upload-image' />
            </IconButton>
            {collegeLogo && (
              <IconButton
                sx={{ bottom: '0px', right: '-30px' }}
                className='position-absolute bg-success'
                onClick={handleUploadCollegeLogo}
              >
                <GetChaarvyIcons iconName='ContentSave' color='white' />
              </IconButton>
            )}
          </Box>
          {[
            { v: 'college_code', l: 'College Code' },
            { v: 'college_name', l: 'College Name' },
            { v: 'campus_name', l: 'Campus Name' },
            { v: 'contact_numbers', l: 'Contact Number' }
          ].map(field => (
            <Grid item xs={12} className='n' key={field.l}>
              <Typography>
                {field.l} : {newDetails?.[field.v as keyof CollegeDetailResponse] ?? '-'}
              </Typography>
            </Grid>
          ))}
        </Box>
        <Box>
          <TabContext value={value}>
            <TabList
              onChange={handleTabChange}
              aria-label='admission-form tabs'
              sx={{ borderBottom: t => `1px solid ${t.palette.divider}` }}
            >
              {tabs.map(({ value, label, icon }) => (
                <Tab
                  key={value}
                  value={value}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {icon}
                      <TabName>{label}</TabName>
                    </Box>
                  }
                />
              ))}
            </TabList>
            <Box margin='1rem 0rem'>
              {tabs.map(({ value, component }) => (
                <TabPanel key={value} sx={{ p: 0 }} value={value}>
                  {component}
                </TabPanel>
              ))}
            </Box>
          </TabContext>
        </Box>
      </Box>
    </Paper>
  )
}

export default ViewCollegeProfile
