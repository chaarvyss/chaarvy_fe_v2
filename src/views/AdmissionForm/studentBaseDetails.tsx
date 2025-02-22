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
import {
  useGetProgramsListQuery,
  useGetQualifiedExamsListQuery,
  useGetOccupationsListQuery,
  useGetGendersListQuery,
  useGetCommunitiesListQuery,
  useGetReligionsListQuery
} from 'src/store/services/listServices'
import { Address, CreateStudentAdmissionRequest } from 'src/store/services/admisissionsService'
import {
  useLazyGetProgramMediumsListQuery,
  useLazyGetProgramSecondLanguagesListQuery
} from 'src/store/services/programServices'

const CustomInput = forwardRef((props, ref) => {
  return <TextField fullWidth {...props} inputRef={ref} label='Birth Date' autoComplete='off' />
})

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const TOP_LEVEL_ID = 'student-application-form'

const getLast20Years = (): number[] => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 20 }, (_, i) => currentYear - i)
}

const StudentBaseDetails = () => {
  const [studentImg, setStudentImg] = useState(null)

  const [applicationDetails, setApplicationDetails] = useState<CreateStudentAdmissionRequest>()
  const [fetchProgramMediums, { data: programMediums }] = useLazyGetProgramMediumsListQuery()
  const [fetchProgramSecondLanguages, { data: programSecondLanguages }] = useLazyGetProgramSecondLanguagesListQuery()
  const { data: occupationsList } = useGetOccupationsListQuery()
  const { data: gendersList } = useGetGendersListQuery()
  const { data: communities } = useGetCommunitiesListQuery()
  const { data: religions } = useGetReligionsListQuery()

  const [dob, setDob] = useState<Date>(new Date())

  const { data: qualifiedExams } = useGetQualifiedExamsListQuery()
  const { data: programsList } = useGetProgramsListQuery(true)

  const getDependentData = (program_id: string) => {
    fetchProgramMediums(program_id)
    fetchProgramSecondLanguages(program_id)
  }

  const handleChange =
    (prop: keyof CreateStudentAdmissionRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      if (prop === 'program_id') {
        getDependentData(event.target.value)
      }
      setApplicationDetails({ ...applicationDetails, [prop]: event.target.value })
    }

  return (
    <DatePickerWrapper>
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
              <TextField
                fullWidth
                id={`${TOP_LEVEL_ID}__student-name`}
                label='Student Name'
                value={applicationDetails?.student_name}
                placeholder='student name'
                onChange={handleChange('student_name')}
              />
              <small>As per SSC Records</small>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Qualified Exam</InputLabel>
                <Select
                  label='Qualified Exam'
                  id={`${TOP_LEVEL_ID}__qualified-exam`}
                  value={applicationDetails?.qualified_exam}
                  onChange={handleChange('qualified_exam')}
                >
                  {(qualifiedExams ?? []).map(each => (
                    <MenuItem value={each.qualified_exam_id}>{each.qualified_exam_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                value={applicationDetails?.qualified_exam_hallticket_no}
                onChange={handleChange('qualified_exam_hallticket_no')}
                id={`${TOP_LEVEL_ID}__qualified-exam-hallticket`}
                fullWidth
                label='Hall ticket number'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Year of pass</InputLabel>
                <Select
                  label='Year of pass'
                  value={applicationDetails?.qualified_exam_year_of_pass}
                  onChange={handleChange('qualified_exam_year_of_pass')}
                  id={`${TOP_LEVEL_ID}__qualified-exam-year-of-pass`}
                >
                  {getLast20Years().map(each => (
                    <MenuItem value={each}>{each}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Group</InputLabel>
                <Select
                  label='Group'
                  id={`${TOP_LEVEL_ID}__joining-group`}
                  value={applicationDetails?.program_id}
                  onChange={handleChange('program_id')}
                >
                  {(programsList ?? []).map(eachProgram => (
                    <MenuItem value={eachProgram.program_id}>{eachProgram.program_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Medium</InputLabel>
                <Select
                  label='Medium'
                  id={`${TOP_LEVEL_ID}__medium`}
                  value={applicationDetails?.medium}
                  onChange={handleChange('medium')}
                >
                  {(programMediums ?? []).map(each => (
                    <MenuItem value={each.language_id}>{each.language_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Second Language</InputLabel>
                <Select
                  label='Second Language'
                  id={`${TOP_LEVEL_ID}__second-language`}
                  value={applicationDetails?.secondLanguage}
                  onChange={handleChange('secondLanguage')}
                >
                  {(programSecondLanguages ?? []).map(each => (
                    <MenuItem value={each.language_id}>{each.language_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                selected={dob}
                showYearDropdown
                showMonthDropdown
                placeholderText='MM/DD/YYYY'
                customInput={<CustomInput />}
                id='student-dob'
                onChange={(date: Date) => setDob(date)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Father Name'
                id={`${TOP_LEVEL_ID}__father-name`}
                value={applicationDetails?.father_name}
                onChange={handleChange('father_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Father Occupation</InputLabel>
                <Select
                  label='Father Occupation'
                  id={`${TOP_LEVEL_ID}__father_occupation`}
                  value={applicationDetails?.father_occupation}
                  onChange={handleChange('father_occupation')}
                >
                  {(occupationsList ?? []).map(each => (
                    <MenuItem value={each.occupation_id}>{each.occupation_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mother Name'
                id={`${TOP_LEVEL_ID}__mother-name`}
                value={applicationDetails?.mother_name}
                onChange={handleChange('mother_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Mother Occupation</InputLabel>
                <Select
                  label='Mother Occupation'
                  id={`${TOP_LEVEL_ID}__mother-occupation`}
                  value={applicationDetails?.mother_occupation}
                  onChange={handleChange('mother_occupation')}
                >
                  {(occupationsList ?? []).map(each => (
                    <MenuItem value={each.occupation_id}>{each.occupation_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl>
                <FormLabel id='student-application-gender'>Gender</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby='student-application-gender'
                  name='radio-buttons-group'
                  id={`${TOP_LEVEL_ID}__father_occupation`}
                  value={applicationDetails?.gender}
                  onChange={handleChange('gender')}
                >
                  {(gendersList ?? []).map(each => (
                    <FormControlLabel value={each.gender_id} control={<Radio />} label={each.gender_name} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='email'
                label='Student Email'
                placeholder='johnDoe@example.com'
                id={`${TOP_LEVEL_ID}__student-email`}
                value={applicationDetails?.student_email}
                onChange={handleChange('student_email')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Phone Number'
                id={`${TOP_LEVEL_ID}__student-phone`}
                value={applicationDetails?.contact_no_1}
                onChange={handleChange('contact_no_1')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Alternative Phone Number'
                id={`${TOP_LEVEL_ID}__alt-phone`}
                value={applicationDetails?.contact_no_2}
                onChange={handleChange('contact_no_2')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Student Aadhaar'
                id={`${TOP_LEVEL_ID}__student-aadhar`}
                value={applicationDetails?.student_aadhar}
                onChange={handleChange('student_aadhar')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Father Aadhaar'
                id={`${TOP_LEVEL_ID}__father-aadhar`}
                value={applicationDetails?.father_aadhar}
                onChange={handleChange('father_aadhar')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Mother Aadhaar'
                id={`${TOP_LEVEL_ID}__mother-aadhar`}
                value={applicationDetails?.mother_aadhar}
                onChange={handleChange('mother_aadhar')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Religion</InputLabel>
                <Select
                  label='Religion'
                  id={`${TOP_LEVEL_ID}__religion`}
                  value={applicationDetails?.religion}
                  onChange={handleChange('religion')}
                >
                  {(religions ?? []).map(each => (
                    <MenuItem value={each.religion_id}>{each.religion_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Caste / Community</InputLabel>
                <Select
                  label='Caste / Community'
                  id={`${TOP_LEVEL_ID}__caste`}
                  value={applicationDetails?.community}
                  onChange={handleChange('community')}
                >
                  {(communities ?? []).map(each => (
                    <MenuItem value={each.community_id}>{each.community_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='subcaste'
                id={`${TOP_LEVEL_ID}__sub-caste`}
                value={applicationDetails?.subcaste}
                onChange={handleChange('subcaste')}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='contained'
                sx={{ marginRight: 3.5 }}
                onClick={() => console.log(applicationDetails, 'raja')}
              >
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

export default StudentBaseDetails
