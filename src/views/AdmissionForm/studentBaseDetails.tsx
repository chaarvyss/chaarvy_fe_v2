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
import React, { ChangeEvent, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import { Button, FormControl, Grid, TextField } from '@muiElements'
import { useImageViewer } from 'src/@core/context/imageViewerContext'
import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { DateFormats, InputTypes, InputVariants } from 'src/lib/enums'
import { dateToString } from 'src/lib/helpers'
import { ErrorObject, InputFields } from 'src/lib/types'
import CustomDateElement from 'src/reusable_components/dateInputElement'
import { ImgStyled } from 'src/reusable_components/styledComponents/styledImgTag'
import {
  CreateStudentAdmissionRequest,
  useCreateUpdateAdmissionMutation,
  useLazyGetProcessingFeesQuery,
  useLazyGetAdmissionDetailQuery,
  useUploadStudentPhotoMutation
} from 'src/store/services/admisissionsService'
import {
  useLazyGetApplicationFeesPaymentQuery,
  useLazyUpdateApplicationPaymentQuery
} from 'src/store/services/feesServices'
import {
  useGetProgramsListQuery,
  useGetGendersListQuery,
  useGetSegmentsListQuery
} from 'src/store/services/listServices'
import {
  useLazyGetProgramMediumsListQuery,
  useLazyGetProgramSecondLanguagesListQuery,
  useLazyGetProgramSectionListQuery
} from 'src/store/services/programServices'
import { convertDateStringToDate } from 'src/utils/helpers'

import { LoadingButton } from '@mui/lab'


import { useRouter } from 'next/router'

import ApplicationFeesModal from './application_fees_modal'

import { AdmissionFormType } from '.'

const TOP_LEVEL_ID = 'student-application-form'

interface studentBaseDetailsProps {
  application_id?: string
  onAdmissionCreation: (application_id: string) => void
  handleNext: (step: AdmissionFormType) => void
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
  'section',
  'gender'
]

const StudentBaseDetails = ({ application_id, onAdmissionCreation, handleNext }: studentBaseDetailsProps) => {
  const [errors, setErrors] = useState<Array<ErrorObject>>([])
  const [image, setImage] = useState<string | null>(null)
  const [studentImg, setStudentImg] = useState<File>()
  const [applicationDetails, setApplicationDetails] = useState<CreateStudentAdmissionRequest>()
  const [dob, setDob] = useState<Date>()
  const [isNew, setIsNew] = useState<boolean>(true)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false)

  const { triggerToast } = useToast()
  const { setLoading } = useLoader()
  const router = useRouter()

  const { setShowImage } = useImageViewer()

  const handleImageViewClick = (url: string) => {
    if (setShowImage) {
      setShowImage(url)
    }
  }

  const [fetchProgramMediums, { data: programMediums, isFetching: isProgramMediumsLoading }] =
    useLazyGetProgramMediumsListQuery()
  const [fetchProgramSecondLanguages, { data: programSecondLanguages, isFetching: isSecondLanguageLoading }] =
    useLazyGetProgramSecondLanguagesListQuery()

  const [fetchProgramSectionsData, { data: programSections, isFetching: isSectionsLoading }] =
    useLazyGetProgramSectionListQuery()

  const { data: gendersList } = useGetGendersListQuery()
  const { data: segmentsList } = useGetSegmentsListQuery()
  const { data: programsList } = useGetProgramsListQuery(true)

  const [createUpdateAdmission, { isLoading: IsupdatingAdmission }] = useCreateUpdateAdmissionMutation()
  const [uploadStudentPhoto, { isLoading: isUploadingPhoto }] = useUploadStudentPhotoMutation()
  const [fetchApplicationDetail, { isLoading: isApplicationLoading }] = useLazyGetAdmissionDetailQuery()
  const [createPayment, { isLoading }] = useLazyGetApplicationFeesPaymentQuery()

  const [updateApplicationPayment] = useLazyUpdateApplicationPaymentQuery()

  const getDependentData = (program_id: string) => {
    fetchProgramMediums(program_id)
    fetchProgramSecondLanguages(program_id)
    fetchProgramSectionsData(program_id)
  }

  const [fetchProcessingFees, { data: processingFees }] = useLazyGetProcessingFeesQuery()

  const showLoader = isApplicationLoading

  setLoading(showLoader)

  useEffect(() => {
    fetchProcessingFees()
    let apl_id
    let razorpay_payment_link_status
    let segment_id
    let transaction_id
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      apl_id = queryParams.get('id') ?? application_id
      razorpay_payment_link_status = queryParams.get('razorpay_payment_link_status')
      segment_id = queryParams.get('segment_id')
      transaction_id = queryParams.get('razorpay_payment_id')
    }
    if (apl_id) {
      setIsNew(false)
      fetchApplicationDetail(apl_id).then(({ data: res }) => {
        if (res?.program_id) {
          getDependentData(res?.program_id)
        }
        setApplicationDetails(res)
        setDob(convertDateStringToDate(res?.dob))
        setImage(res?.photo_url ?? null)
        if (res?.application_fees_status == null) {
          setIsPaymentModalOpen(true)
        }
      })
    }

    if (razorpay_payment_link_status == 'paid') {
      updateApplicationPayment({ application_id: apl_id, segment_id, transaction_id })
        .unwrap()
        .then(() => {
          const url = window.location.origin + window.location.pathname
          window.history.replaceState({}, document.title, url)
          handleNext(AdmissionFormType.STUDENT_DETAIL)
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

  const handleCreatePayment = async (application_id, segment_id, email, source: 'web' | 'app') => {
    try {
      const response = await createPayment({ application_id, segment_id, email, source }).unwrap()
      router.push(response.short_url)
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Failed to create payment link.')
    }
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      triggerToast('Please correct the errors before submitting.', { variant: ToastVariants.ERROR })

      return
    }

    const finalData = { ...applicationDetails }
    if (applicationDetails) {
      if (application_id) finalData.application_id = application_id
      createUpdateAdmission({
        ...finalData,
        dob: dateToString(dob, DateFormats.YearMonthDate) ?? ''
      })
        .unwrap()
        .then(({ application_id, message }) => {
          if (application_id) {
            if (applicationDetails.application_fees_status != '1') {
              setIsPaymentModalOpen(true)
            } else {
              handleNext(AdmissionFormType.STUDENT_DETAIL)
            }
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
      id: `${TOP_LEVEL_ID}__section`,
      label: 'Section',
      key: 'section',
      value: applicationDetails?.section,
      onChange: handleChange('section'),
      menuOptions: (programSections ?? []).map(each => {
        return { value: each.section_id, label: each.section_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__medium`,
      label: 'Medium',
      key: 'medium',
      isLoading: isProgramMediumsLoading,
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
      isLoading: isSecondLanguageLoading,
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

  const handleCollectButtonClick = () => {
    if (applicationDetails) {
      handleCreatePayment(application_id, applicationDetails.segment, applicationDetails.student_email, 'app')
    }
  }

  return (
    <CardContent>
      <ApplicationFeesModal
        isOpen={isPaymentModalOpen}
        isLoading={isLoading}
        onCollectClick={handleCollectButtonClick}
        processingFees={processingFees ?? 0}
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
          {isNew && (
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
              {isNew ? 'Enroll' : 'Save'} and Continue
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default StudentBaseDetails
