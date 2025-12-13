import { SelectChangeEvent } from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { Box, Button, Grid, TextField } from '@muiElements'
import { InputVariants } from 'src/lib/enums'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import StyledImage from 'src/reusable_components/styledImage'
import { CollegeDetailResponse } from 'src/store/services/viewServices'

interface Props {
  isOpen: boolean
  details?: CollegeDetailResponse
}

const MydetailsModal = ({ isOpen, details }: Props) => {
  const [newDetails, setNewDetails] = useState(details)
  const [collegeLogo, setCollegeLogo] = useState<File>()
  const [collegeLogoUrl, setCollegeLogoUrl] = useState<string>()

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

  return (
    <ChaarvyModal
      modalSize='col-12 col-md-6'
      shouldRestrictCloseOnOuterClick
      title='Fill Basic Details'
      isOpen={isOpen}
    >
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
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'end' }}>
            <StyledImage src={collegeLogoUrl ?? '/images/avatars/1.png'} alt='add photo' />
            <Button component='label' variant='contained' htmlFor='upload-image'>
              Upload College logo
              <input hidden type='file' onChange={handleImageUpload} accept='image/png, image/jpeg' id='upload-image' />
            </Button>
          </Box>
        </Grid>
      </Grid>
    </ChaarvyModal>
  )
}

export default MydetailsModal
