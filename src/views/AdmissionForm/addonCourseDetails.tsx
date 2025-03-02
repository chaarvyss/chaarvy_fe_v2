import { Box, Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { Grid } from '@muiElements'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import {
  useEnrollAddonCourseMutation,
  useLazyGetStudentEnrollendAddonCoursesQuery
} from 'src/store/services/admisissionsService'
import { useLazyGetProgramAddonListQuery } from 'src/store/services/programServices'

interface AddonCourseDetailsProps {
  application_id?: string
  programId?: string
}

const AddonCourseDetails = ({ application_id, programId }: AddonCourseDetailsProps) => {
  const [fetchAddonCourse, { data: addonCourses }] = useLazyGetProgramAddonListQuery()
  const [selectedAddonCourses, setSelectedAddonCourses] = useState<Array<string>>([])
  const [fetchStudentEnrolledAddonCourses] = useLazyGetStudentEnrollendAddonCoursesQuery()

  const [enrollAddonCourse] = useEnrollAddonCourseMutation()

  const { triggerToast } = useToast()
  useEffect(() => {
    programId && fetchAddonCourse(programId)
    application_id &&
      fetchStudentEnrolledAddonCourses(application_id).then(({ data: res }) =>
        setSelectedAddonCourses(res?.map(each => each.program_addon_course_id) ?? [])
      )
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedAddonCourses(prev =>
      prev.includes(e.target.id) ? prev.filter(courseId => courseId !== e.target.id) : [...prev, e.target.id]
    )
  }

  const handleSubmit = () => {
    if (application_id) {
      enrollAddonCourse({
        application_id,
        addon_courses: selectedAddonCourses
      })
        .then(({ data: res }) => {
          if (res) {
            triggerToast(res, { variant: ToastVariants.SUCCESS })
          }
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  return (
    <Box padding='1rem'>
      <Typography variant='h6' marginBottom='1rem'>
        Add on Courses
      </Typography>
      <FormGroup>
        <Grid container spacing={2} justifyContent='center'>
          {addonCourses?.map(each => (
            <Grid item sm={12} md={6}>
              <FormControlLabel
                key={each.addon_course_id}
                control={
                  <Checkbox
                    id={each.program_addon_course_id}
                    onChange={handleChange}
                    checked={selectedAddonCourses.includes(each.program_addon_course_id)}
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
      <Box justifyContent='center' display='flex'>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </Box>
    </Box>
  )
}

export default AddonCourseDetails
