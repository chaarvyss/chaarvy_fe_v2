import {
  Box,
  CardContent,
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
import React, { ChangeEvent, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Button, FormControl, Grid, TextField } from '@muiElements'

import {
  useGetProgramsListQuery,
  useGetQualifiedExamsListQuery,
  useGetOccupationsListQuery,
  useGetGendersListQuery,
  useGetCommunitiesListQuery,
  useGetReligionsListQuery,
  useGetSegmentsListQuery
} from 'src/store/services/listServices'
import {
  CreateStudentAdmissionRequest,
  useCreateUpdateAdmissionMutation,
  useLazyGetAdmissionDetailQuery,
  useUploadStudentPhotoMutation
} from 'src/store/services/admisissionsService'
import {
  useLazyGetProgramMediumsListQuery,
  useLazyGetProgramSecondLanguagesListQuery
} from 'src/store/services/programServices'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ErrorObject, InputFields } from 'src/lib/types'
import { DateFormats, InputTypes, InputVariants } from 'src/lib/enums'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import { convertDateStringToDate } from 'src/utils/helpers'
import { useLoader } from 'src/@core/context/loaderContext'
import { dateToString } from 'src/lib/helpers'
import { useImageViewer } from 'src/@core/context/imageViewerContext'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const TOP_LEVEL_ID = 'student-application-form'

const getLast10Years = (): number[] => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
}

interface studentBaseDetailsProps {
  application_id?: string
  onAdmissionCreation: (application_id: string) => void
}

const mandatoryFields = [
  'admission_number',
  'contact_no_1',
  'medium',
  'program_id',
  'segment',
  'second_language',
  'student_email',
  'student_aadhar',
  'student_name',
  'dob',
  'gender'
]

const StudentBaseDetails = ({ application_id, onAdmissionCreation }: studentBaseDetailsProps) => {
  const [errors, setErrors] = useState<Array<ErrorObject>>([])
  const [image, setImage] = useState<string | null>(null)
  const [studentImg, setStudentImg] = useState<File>()
  const [applicationDetails, setApplicationDetails] = useState<CreateStudentAdmissionRequest>()
  const [dob, setDob] = useState<Date>()

  const { triggerToast } = useToast()
  const { setLoading } = useLoader()

  const { setShowImage } = useImageViewer()

  const handleImageViewClick = (url: string) => {
    if (setShowImage) {
      setShowImage(url)
    }
  }

  const [fetchProgramMediums, { data: programMediums }] = useLazyGetProgramMediumsListQuery()
  const [fetchProgramSecondLanguages, { data: programSecondLanguages }] = useLazyGetProgramSecondLanguagesListQuery()
  const { data: occupationsList } = useGetOccupationsListQuery()
  const { data: gendersList } = useGetGendersListQuery()
  const { data: communities } = useGetCommunitiesListQuery()
  const { data: religions } = useGetReligionsListQuery()
  const { data: qualifiedExams } = useGetQualifiedExamsListQuery()
  const { data: segmentsList } = useGetSegmentsListQuery()
  const { data: programsList } = useGetProgramsListQuery(true)

  const [createUpdateAdmission] = useCreateUpdateAdmissionMutation()
  const [uploadStudentPhoto] = useUploadStudentPhotoMutation()
  const [fetchApplicationDetail, { isLoading: isApplicationLoading }] = useLazyGetAdmissionDetailQuery()

  const getDependentData = (program_id: string) => {
    fetchProgramMediums(program_id)
    fetchProgramSecondLanguages(program_id)
  }

  const showLoader = isApplicationLoading

  setLoading(showLoader)

  useEffect(() => {
    let apl_id
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      apl_id = queryParams.get('id') ?? application_id
    }
    if (apl_id) {
      fetchApplicationDetail(apl_id).then(({ data: res }) => {
        if (res?.program_id) {
          getDependentData(res?.program_id)
        }
        setApplicationDetails(res)
        setDob(convertDateStringToDate(res?.dob))
        setImage(res?.photo_url ?? null)
      })
    }
  }, [])

  const handleChange =
    (prop: keyof CreateStudentAdmissionRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event

      const error = validateField(prop, value)
      setErrors(error ? [...errors, error] : errors.filter(({ errorkey }) => errorkey !== prop))

      setApplicationDetails(prev => ({ ...prev, [prop]: value }))

      if (prop === 'program_id') {
        getDependentData(value)
      }
    }

  const validateField = (
    key: keyof CreateStudentAdmissionRequest,
    value: any
  ): { errorkey: string; error: string } | null => {
    if (key == 'dob') return dob ? null : { errorkey: key, error: '* Required.' }
    if (!value) {
      return { errorkey: key, error: '* Required' }
    }

    switch (key) {
      case 'student_email':
        return /\S+@\S+\.\S+/.test(value) ? null : { errorkey: key, error: 'Invalid email format.' }
      case 'contact_no_1':
        return /^[6-9]\d{9}$/.test(value) ? null : { errorkey: key, error: 'Invalid phone number.' }
      case 'contact_no_2':
        return /^[6-9]\d{9}$/.test(value) ? null : { errorkey: key, error: 'Invalid phone number.' }
      case 'student_aadhar':
        return /^\d{12}$/.test(value) ? null : { errorkey: key, error: 'Invalid Aadhar number. It must be 12 digits.' }
      case 'father_aadhar':
        return /^\d{12}$/.test(value) ? null : { errorkey: key, error: 'Invalid Aadhar number. It must be 12 digits.' }
      case 'mother_aadhar':
        return /^\d{12}$/.test(value) ? null : { errorkey: key, error: 'Invalid Aadhar number. It must be 12 digits.' }
      default:
        return null
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ErrorObject[] = []

    if (!studentImg && !image) newErrors.push({ errorkey: 'student_image', error: '* Required' })

    mandatoryFields.forEach(field => {
      const key = field as keyof CreateStudentAdmissionRequest
      const error = validateField(key, applicationDetails?.[key])
      if (error) newErrors.push(error)
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      triggerToast('Please correct the errors before submitting.', { variant: ToastVariants.ERROR })
      return
    }
    if (applicationDetails) {
      if (application_id) applicationDetails.application_id = application_id
      createUpdateAdmission({
        ...applicationDetails,
        dob: dateToString(dob, DateFormats.YearMonthDate) ?? ''
      })
        .unwrap()
        .then(({ application_id, message }) => {
          if (application_id) {
            onAdmissionCreation(application_id)
            if (studentImg) {
              uploadStudentPhoto({
                application_id: application_id,
                photo: studentImg
              })
            }
          }
          triggerToast(message ?? 'New application created', { variant: ToastVariants.SUCCESS })
        })
        .catch(res => triggerToast(res.data, { variant: ToastVariants.ERROR }))
    }
  }

  const fields: InputFields[] = [
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__admission-number`,
      label: 'Admission number',
      key: 'admission_number',
      value: applicationDetails?.admission_number,
      onChange: handleChange('admission_number')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__student-name`,
      label: 'Student Name',
      key: 'student_name',
      value: applicationDetails?.student_name,
      placeholder: 'Student Name',
      onChange: handleChange('student_name'),
      caption: 'As per SSC Records'
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__qualified-exam`,
      label: 'Qualified Exam',
      key: 'qualified_exam',
      value: applicationDetails?.qualified_exam,
      onChange: handleChange('qualified_exam'),
      menuOptions: (qualifiedExams ?? []).map(each => {
        return { value: each.qualified_exam_id, label: each.qualified_exam_name }
      })
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      key: 'qualified_exam_hallticket_no',
      id: `${TOP_LEVEL_ID}__qualified_exam_hallticket_no`,
      label: 'Hall ticket number',
      value: applicationDetails?.qualified_exam_hallticket_no,
      onChange: handleChange('qualified_exam_hallticket_no')
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__qualified_exam_year_of_pass`,
      label: 'Year of pass',
      key: 'qualified_exam_year_of_pass',
      value: applicationDetails?.qualified_exam_year_of_pass,
      onChange: handleChange('qualified_exam_year_of_pass'),
      menuOptions: getLast10Years().map(each => {
        return { value: `${each}`, label: `${each}` }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__joining-group`,
      label: 'Group',
      key: 'program_id',
      value: applicationDetails?.program_id,
      onChange: handleChange('program_id'),
      menuOptions: (programsList ?? []).map(each => {
        return { value: each.program_id, label: each.program_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__joining-segment`,
      label: 'Year',
      key: 'segment',
      value: applicationDetails?.segment,
      onChange: handleChange('segment'),
      menuOptions: (segmentsList ?? []).map(each => {
        return { value: each.segment_id, label: each.segment_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__medium`,
      label: 'Medium',
      key: 'medium',
      value: applicationDetails?.medium,
      onChange: handleChange('medium'),
      menuOptions: (programMediums ?? []).map(each => {
        return { value: each.language_id, label: each.language_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__second-language`,
      label: 'Second Language',
      key: 'second_language',
      value: applicationDetails?.second_language,
      onChange: handleChange('second_language'),
      menuOptions: (programSecondLanguages ?? []).map(each => {
        return { value: each.language_id, label: each.language_name }
      })
    },
    {
      type: InputTypes.RADIO,
      id: `${TOP_LEVEL_ID}__gender`,
      label: 'Gender',
      key: 'gender',
      value: applicationDetails?.gender,
      onChange: handleChange('gender'),
      menuOptions: (gendersList ?? []).map(each => {
        return { value: each.gender_id, label: each.gender_name }
      })
    },
    {
      type: InputTypes.DATE,
      id: `${TOP_LEVEL_ID}__student-dob`,
      label: '',
      key: 'dob',
      value: dob,
      customInput: <CustomDateElement label='' />,
      onChange: (date: Date) => setDob(date)
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__father-name`,
      key: 'father_name',
      label: 'Father Name',
      value: applicationDetails?.father_name,
      onChange: handleChange('father_name')
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__father-occupation`,
      label: 'Father Occupation',
      key: 'father_occupation',
      value: applicationDetails?.father_occupation,
      onChange: handleChange('father_occupation'),
      menuOptions: (occupationsList ?? []).map(each => {
        return { value: each.occupation_id, label: each.occupation_name }
      })
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__mother-name`,
      key: 'mother_name',
      label: 'Mother Name',
      value: applicationDetails?.mother_name,
      onChange: handleChange('mother_name')
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__mother-occupation`,
      label: 'Mother Occupation',
      key: 'mother_occupation',
      value: applicationDetails?.mother_occupation,
      onChange: handleChange('mother_occupation'),
      menuOptions: (occupationsList ?? []).map(each => {
        return { value: each.occupation_id, label: each.occupation_name }
      })
    },

    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__student_email`,
      key: 'student_email',
      label: 'Student Email',
      value: applicationDetails?.student_email,
      onChange: handleChange('student_email')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__student_phone`,
      key: 'contact_no_1',
      label: 'Mobile number',
      value: applicationDetails?.contact_no_1,
      onChange: handleChange('contact_no_1')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__alt-phone`,
      key: 'contact_no_2',
      label: 'Alternative number',
      value: applicationDetails?.contact_no_2,
      onChange: handleChange('contact_no_2')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__student-aadhar-number`,
      key: 'student_aadhar',
      label: 'Student Aadhar',
      value: applicationDetails?.student_aadhar,
      onChange: handleChange('student_aadhar')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__father-aadhar-number`,
      key: 'father_aadhar',
      label: 'Father Aadhar',
      value: applicationDetails?.father_aadhar,
      onChange: handleChange('father_aadhar')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: `${TOP_LEVEL_ID}__mother-aadhar-number`,
      key: 'mother_aadhar',
      label: 'Mother Aadhar',
      value: applicationDetails?.mother_aadhar,
      onChange: handleChange('mother_aadhar')
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__religion`,
      label: 'Religion',
      key: 'religion',
      value: applicationDetails?.religion,
      onChange: handleChange('religion'),
      menuOptions: (religions ?? []).map(each => {
        return { value: each.religion_id, label: each.religion_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__caste`,
      label: 'Caste / Community',
      key: 'community',
      value: applicationDetails?.community,
      onChange: handleChange('community'),
      menuOptions: (communities ?? []).map(each => {
        return { value: each.community_id, label: each.community_name }
      })
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__mother-aadhar-number`,
      key: 'subcaste',
      label: 'Sub Caste',
      value: applicationDetails?.subcaste,
      onChange: handleChange('subcaste')
    }
  ]

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
        ) : type === InputTypes.RADIO ? (
          <Grid item xs={12}>
            <FormControl required error={!!getHadError(key)}>
              <FormLabel id={id}>{label}</FormLabel>
              <RadioGroup
                row
                aria-labelledby={id}
                name={id}
                id={id}
                value={value ?? ''}
                onChange={(_, val) =>
                  handleChange(key as keyof CreateStudentAdmissionRequest)({
                    target: { value: val }
                  } as ChangeEvent<HTMLInputElement>)
                }
              >
                {(menuOptions ?? []).map(each => (
                  <FormControlLabel value={each.value} control={<Radio />} label={each.label} />
                ))}
              </RadioGroup>
              {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
            </FormControl>
          </Grid>
        ) : type === InputTypes.DATE ? (
          <Grid item xs={12}>
            <Box display='flex' flexDirection='column'>
              <small>Date of Birth</small>
              <DatePicker
                selected={dob}
                required={mandatoryFields.includes(key)}
                customInput={customInput}
                id={id}
                onChange={onChange}
              />
              {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
            </Box>
          </Grid>
        ) : null}
      </Grid>
    ))

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 512000) {
        triggerToast(`Given file size is ${file.size / 1024}kb `, { variant: ToastVariants.ERROR })
        setErrors([
          ...errors,
          { errorkey: 'student_image', error: 'Allowed File size must be between 300 KB and 500 KB.' }
        ])
        return
      } else {
        setErrors(errors.filter(({ errorkey }) => errorkey !== 'student_image'))
      }
      setStudentImg(file)
      setImage(URL.createObjectURL(file))
    }
  }

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'end' }}>
              <ImgStyled
                onClick={() => handleImageViewClick(image ?? '')}
                src={image ?? '/images/avatars/1.png'}
                alt='add photo'
                style={{ cursor: 'pointer' }}
              />
              <Box>
                <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                  Upload Photo
                  <input
                    hidden
                    type='file'
                    onChange={handleImageUpload}
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </Button>
                <Typography variant='body2' color={getHadError('student_image') ? 'red' : ''} sx={{ marginTop: 5 }}>
                  {(getHadError('student_image') ? getHadError('student_image')?.error : null) ??
                    'Allowed File size must be between 300 KB and 500 KB.'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          {renderInputFields()}

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmit}>
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default StudentBaseDetails
