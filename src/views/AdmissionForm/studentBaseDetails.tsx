import { LoadingButton } from '@mui/lab'
import {
  Box,
  CardContent,
  CircularProgress,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material'
import { useRouter } from 'next/router'
import React, { ChangeEvent, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { Button, FormControl, Grid, TextField } from '@muiElements'
import { useImageViewer } from 'src/@core/context/imageViewerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { DateFormats, InputTypes, InputVariants } from 'src/lib/enums'
import { dateToString } from 'src/lib/helpers'
import { ErrorObject, InputFields } from 'src/lib/types'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import LoadingSpinner from 'src/reusable_components/LoadingSpinner'
import { ImgStyled } from 'src/reusable_components/styledComponents/styledImgTag'
import {
  useUploadStudentPhotoMutation,
  useGetActiveProgramSegmentsQuery,
  useGetActiveSegmentMediumsQuery,
  useGetActiveMediumSectionsQuery,
  useCreateUpdateAdmissionFormOneMutation,
  useGetProcessingFeesQuery,
  useGetAdmissionFormOneDetailQuery
} from 'src/store/services/admisissionsService'
import { useGetApplicationFeesPaymentMutation } from 'src/store/services/feesServices'
import { useGetProgramsListQuery, useGetGendersListQuery } from 'src/store/services/listServices'
import { convertDateStringToDate, isValidAadhar, isValidEmail, isValidPhone } from 'src/utils/helpers'

import ApplicationFeesModal from './application_fees_modal'

import { AdmissionFormType } from '.'

const TOP_LEVEL_ID = 'student-application-form'

interface studentBaseDetailsProps {
  student_id?: string
  onAdmissionCreation: (application_id: string) => void
  handleNext: (step: AdmissionFormType) => void
  handleTabDisable: (status: boolean) => void
}

const mandatoryFields = [
  'admission_number',
  'contact_no_1',
  'medium_id',
  'program_id',
  'segment_id',
  'pen_number',
  'apaar_number',
  'student_email',
  'student_aadhar',
  'student_name',
  'dob',
  'section_id',
  'gender_id'
]

const defaultFormData = {
  admission_number: '',
  contact_no_1: '',
  medium_id: '',
  program_id: '',
  segment_id: '',
  pen_number: '',
  apaar_number: '',
  student_email: '',
  student_aadhar: '',
  student_name: '',
  dob: '',
  section_id: '',
  gender_id: ''
}

const StudentBaseDetails = ({
  student_id,
  onAdmissionCreation,
  handleNext,
  handleTabDisable
}: studentBaseDetailsProps) => {
  const [errors, setErrors] = useState<Array<ErrorObject>>([])
  const [image, setImage] = useState<string>()
  const [studentImg, setStudentImg] = useState<File>()
  const [applicationDetails, setApplicationDetails] = useState<CreateUpdateAdmissionFormOneRequest>(defaultFormData)
  const [dob, setDob] = useState<Date>()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false)

  const [studentCourseEnrollmentId, setStudentCourseEnrollmentId] = useState<string>()

  const { triggerToast } = useToast()
  const router = useRouter()

  const { setShowImage } = useImageViewer()

  const handleImageViewClick = (url: string) => {
    if (setShowImage) {
      setShowImage(url)
    }
  }

  const { data: programsList, isFetching: isProgramsLoading } = useGetProgramsListQuery(true)
  const { data: gendersList, isFetching: isGendersLoading } = useGetGendersListQuery()

  const { data: segmentsList, isFetching: isSegmentsLoading } = useGetActiveProgramSegmentsQuery(
    applicationDetails?.program_id,
    {
      skip: !applicationDetails?.program_id
    }
  )

  const { data: programMediums, isFetching: isProgramMediumsLoading } = useGetActiveSegmentMediumsQuery(
    { program_id: applicationDetails?.program_id, segment_id: applicationDetails?.segment_id },
    {
      skip: !applicationDetails?.program_id || !applicationDetails.segment_id
    }
  )

  const { data: programSections, isFetching: isSectionsLoading } = useGetActiveMediumSectionsQuery(
    {
      program_id: applicationDetails?.program_id,
      segment_id: applicationDetails?.segment_id,
      medium_id: applicationDetails?.medium_id
    },
    {
      skip: !applicationDetails?.program_id || !applicationDetails.segment_id || !applicationDetails.medium_id
    }
  )

  const { data: admissionFormOneDetail, isFetching: isLoadingOldDetails } = useGetAdmissionFormOneDetailQuery(
    student_id ?? '',
    {
      skip: !student_id
    }
  )

  const [createUpdateAdmission, { isLoading: IsupdatingAdmission }] = useCreateUpdateAdmissionFormOneMutation()
  const [uploadStudentPhoto, { isLoading: isUploadingPhoto }] = useUploadStudentPhotoMutation()
  const [createPayment, { isLoading }] = useGetApplicationFeesPaymentMutation()
  const { data: processingFees } = useGetProcessingFeesQuery()

  useEffect(() => {
    if (!admissionFormOneDetail) return

    const { photo_url, dob, application_fees_status } = admissionFormOneDetail
    setDob(() => convertDateStringToDate(dob))
    setImage(photo_url)

    if (application_fees_status == 1) {
      handleTabDisable(false)
    }
    setApplicationDetails(admissionFormOneDetail)
  }, [admissionFormOneDetail])

  // const showLoader = false

  const handleChange =
    (prop: keyof CreateUpdateAdmissionFormOneRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event
      const error = validateField(prop, value)
      setErrors(error ? [...errors, error] : errors.filter(({ errorkey }) => errorkey !== prop))
      setApplicationDetails(prev => ({ ...prev, [prop]: value }))
    }

  const validateField = (
    key: keyof CreateUpdateAdmissionFormOneRequest,
    value: any
  ): { errorkey: string; error: string } | null => {
    if (key == 'dob') return dob ? null : { errorkey: key, error: '* Required.' }
    if (!value) {
      return { errorkey: key, error: '* Required' }
    }
    switch (key) {
      case 'student_email':
        return isValidEmail(value) ? null : { errorkey: key, error: 'Invalid email format.' }
      case 'contact_no_1':
        return isValidPhone(value) ? null : { errorkey: key, error: 'Invalid phone number.' }
      case 'student_aadhar':
        return isValidAadhar(value) ? null : { errorkey: key, error: 'Invalid Aadhar number. It must be 12 digits.' }
      default:
        return null
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ErrorObject[] = []

    if (!studentImg && !image) newErrors.push({ errorkey: 'student_image', error: '* Required' })

    mandatoryFields.forEach(field => {
      const key = field as keyof CreateUpdateAdmissionFormOneRequest
      const error = validateField(key, applicationDetails?.[key])
      if (error) newErrors.push(error)
    })

    setErrors(newErrors)

    return newErrors.length === 0
  }

  const handleCreatePayment = async () => {
    const email = applicationDetails.student_email
    if (!studentCourseEnrollmentId || !email) return
    try {
      const response = await createPayment({
        student_course_enrollment_id: [studentCourseEnrollmentId],
        email,
        source: 'app'
      }).unwrap()
      router.push(response.short_url)
    } catch (error) {
      console.error('Error creating payment:', error)
    }
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      triggerToast('Please correct the errors before submitting.', { variant: ToastVariants.ERROR })

      return
    }

    const finalData = { ...applicationDetails }
    if (applicationDetails) {
      if (student_id) finalData.student_id = student_id
      createUpdateAdmission({
        ...finalData,
        dob: dateToString(dob, DateFormats.YearMonthDate) ?? ''
      })
        .unwrap()
        .then(({ student_id, message, application_fees_status }) => {
          if (student_id) {
            setStudentCourseEnrollmentId(student_id)
            if (application_fees_status == 0) {
              setIsPaymentModalOpen(true)
            } else {
              handleNext(AdmissionFormType.STUDENT_DETAIL)
            }

            onAdmissionCreation(student_id)
            if (studentImg) {
              uploadStudentPhoto({
                student_id,
                photo: studentImg
              })
            }
          }
          triggerToast(message, { variant: ToastVariants.SUCCESS })
        })
        .catch(error_ => triggerToast(error_.data?.message, { variant: ToastVariants.ERROR }))
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
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__student-pen-number`,
      label: 'Student PEN number',
      key: 'pen_number',
      value: applicationDetails?.pen_number,
      onChange: handleChange('pen_number')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: `${TOP_LEVEL_ID}__student-aapaar-number`,
      label: 'Student Aapaar Number',
      key: 'aapaar-number',
      value: applicationDetails?.apaar_number,
      onChange: handleChange('apaar_number')
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__joining-group`,
      label: 'Program / Group',
      key: 'program_id',
      isLoading: isProgramsLoading,
      value: applicationDetails?.program_id,
      onChange: handleChange('program_id'),
      menuOptions: (programsList ?? []).map(each => {
        return { value: each.program_id, label: each.program_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__joining-segment`,
      label: 'Class',
      key: 'segment',
      isLoading: isSegmentsLoading,
      value: applicationDetails?.segment_id,
      onChange: handleChange('segment_id'),
      menuOptions: (segmentsList ?? []).map(each => {
        return { value: each.segment_id, label: each.segment_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__medium`,
      label: 'Medium',
      key: 'medium_id',
      isLoading: isProgramMediumsLoading,
      value: applicationDetails?.medium_id,
      onChange: handleChange('medium_id'),
      menuOptions: (programMediums ?? []).map(each => {
        return { value: each.medium_id, label: each.medium_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__section`,
      label: 'Section',
      key: 'section',
      isLoading: isSectionsLoading,
      value: applicationDetails?.section_id,
      onChange: handleChange('section_id'),
      menuOptions: (programSections ?? []).map(each => {
        return { value: each.section_id, label: each.section_name }
      })
    },

    {
      type: InputTypes.RADIO,
      id: `${TOP_LEVEL_ID}__gender`,
      label: 'Gender',
      key: 'gender_id',
      value: applicationDetails?.gender_id,
      isLoading: isGendersLoading,
      onChange: handleChange('gender_id'),
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
      id: `${TOP_LEVEL_ID}__student-aadhar-number`,
      key: 'student_aadhar',
      label: 'Student Aadhar',
      value: applicationDetails?.student_aadhar,
      onChange: handleChange('student_aadhar')
    }
  ]

  const getHadError = (key: string) => {
    return errors.find(each => each.errorkey === key)
  }

  const renderInputFields = () =>
    fields.map(
      ({
        type,
        id,
        customInput,
        label,
        placeholder,
        onChange,
        key,
        caption,
        value,
        variant,
        menuOptions,
        isLoading
      }) => (
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
                size='small'
                placeholder={placeholder}
                onChange={onChange}
              />
              {caption && <small>{caption}</small>}
              {getHadError(key) && <small style={{ color: 'red' }}>{getHadError(key)?.error}</small>}
            </>
          ) : type === InputTypes.SELECT ? (
            <FormControl fullWidth required={mandatoryFields.includes(key)}>
              <small>{label}</small>
              <Select size='small' id={id} value={value} onChange={onChange} error={!!getHadError(key)}>
                {isLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={24} />
                  </MenuItem>
                ) : (
                  (menuOptions ?? []).map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))
                )}
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
                  value={value}
                  onChange={(_, val) =>
                    handleChange(key as keyof CreateUpdateAdmissionFormOneRequest)({
                      target: { value: val }
                    } as ChangeEvent<HTMLInputElement>)
                  }
                >
                  {(menuOptions ?? []).map(each => (
                    <FormControlLabel key={each.value} value={each.value} control={<Radio />} label={each.label} />
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
      )
    )

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

  const handleOnclose = () => {
    setIsPaymentModalOpen(false)
    router.push('/StudentManagement/Admissions')
  }

  if (isProgramsLoading || isGendersLoading || isLoadingOldDetails) {
    return <LoadingSpinner />
  }

  return (
    <CardContent>
      <ApplicationFeesModal
        isOpen={isPaymentModalOpen}
        isLoading={isLoading}
        onCollectClick={handleCreatePayment}
        processingFees={processingFees ?? 0}
        onClose={handleOnclose}
      />
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'end', gap: 3 }}>
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
          {!student_id && (
            <Box marginTop={4} marginLeft={8}>
              <Typography variant='h6'>Processing Fees: {processingFees ?? 0}.00/-</Typography>
            </Box>
          )}
          <Grid item xs={12}>
            <LoadingButton
              loading={IsupdatingAdmission || isUploadingPhoto}
              variant='contained'
              sx={{ marginRight: 3.5 }}
              onClick={handleSubmit}
            >
              {student_id ? 'Save' : 'Enroll'} and Continue
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default StudentBaseDetails
