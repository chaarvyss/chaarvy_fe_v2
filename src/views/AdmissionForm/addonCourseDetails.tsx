import { LoadingButton } from '@mui/lab'
import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { Grid } from '@muiElements'
import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import {
  useEnrollAddonCourseMutation,
  useLazyGetStudentEnrollendAddonCoursesQuery
} from 'src/store/services/admisissionsService'
import { useLazyGetProgramAddonListQuery } from 'src/store/services/programServices'

import { AdmissionFormType } from '.'

interface AddonCourseDetailsProps {
  application_id?: string
  programId?: string
  handleNext: (step: AdmissionFormType) => void
}

const AddonCourseDetails = ({ application_id, programId, handleNext }: AddonCourseDetailsProps) => {
  const [fetchAddonCourse, { data: addonCourses, isFetching: isLoadingCourses }] = useLazyGetProgramAddonListQuery()
  const [selectedAddonCourses, setSelectedAddonCourses] = useState<Array<string>>([])
  const [fetchStudentEnrolledAddonCourses] = useLazyGetStudentEnrollendAddonCoursesQuery()
  const [enrollAddonCourse, { isLoading: isEnrollingCourse }] = useEnrollAddonCourseMutation()
  const { triggerToast } = useToast()

  const { setLoading } = useLoader()

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
            handleNext(AdmissionFormType.ADDRESS)
            triggerToast(res, { variant: ToastVariants.SUCCESS })
          }
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  const isLoading = isLoadingCourses
  setLoading(isLoading)

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
        <LoadingButton loading={isEnrollingCourse} onClick={handleSubmit}>
          Save Changes
        </LoadingButton>
      </Box>
    </Box>
  )
}

export default AddonCourseDetails
