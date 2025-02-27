import { Box, Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { Grid } from '@muiElements'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useLazyGetProgramAddonListQuery } from 'src/store/services/programServices'

const AddonCourseDetails = () => {
  const [fetchAddonCourse, { data: addonCourses }] = useLazyGetProgramAddonListQuery()
  sessionStorage.getItem('admission_id')
  const [selectedAddonCourses, setSelectedAddonCourses] = useState<Array<string>>([])

  useEffect(() => {
    fetchAddonCourse('02421814-f4d1-43b1-8180-b50914b0c357')
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedAddonCourses(prev =>
      prev.includes(e.target.id) ? prev.filter(courseId => courseId !== e.target.id) : [...prev, e.target.id]
    )
  }

  const handleSubmit = () => {
    alert('saving student addon courses')
  }

  return (
    <Box padding='1rem'>
      <Typography variant='h6' marginBottom='1rem'>
        Program Second languages
      </Typography>
      <FormGroup>
        <Grid container spacing={2}>
          {addonCourses?.map(each => (
            <Grid item sm={12} md={6}>
              <FormControlLabel
                key={each.addon_course_id}
                control={
                  <Checkbox
                    id={each.addon_course_id}
                    onChange={handleChange}
                    checked={selectedAddonCourses.includes(each.addon_course_id)}
                  />
                }
                label={each.addon_course_name}
              />
            </Grid>
          ))}
        </Grid>
      </FormGroup>
      {(addonCourses ?? []).length == 0 && (
        <Typography marginTop={7} variant='body1' textAlign='center' marginBottom='1rem'>
          Selected Program doesn't offer any ADD-ON Courses.
        </Typography>
      )}
      <Box>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </Box>
    </Box>
  )
}

export default AddonCourseDetails
