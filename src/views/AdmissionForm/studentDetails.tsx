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
import { FormControl, Grid, TextField } from '@muiElements'

import {
  useGetQualifiedExamsListQuery,
  useGetOccupationsListQuery,
  useGetCommunitiesListQuery,
  useGetReligionsListQuery
} from 'src/store/services/listServices'
import {
  CreateStudentAdmissionRequest,
  useCreateUpdateAdmissionMutation,
  useLazyGetAdmissionDetailQuery
} from 'src/store/services/admisissionsService'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { InputFields } from 'src/lib/types'
import { DateFormats, InputTypes, InputVariants } from 'src/lib/enums'
import { convertDateStringToDate } from 'src/utils/helpers'
import { useLoader } from 'src/@core/context/loaderContext'
import { dateToString } from 'src/lib/helpers'
import { LoadingButton } from '@mui/lab'
import { AdmissionFormType } from '.'

const TOP_LEVEL_ID = 'student-application-form'

const getLast10Years = (): number[] => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
}

interface studentBaseDetailsProps {
  application_id?: string
  onAdmissionCreation: (application_id: string) => void
  handleNext: (step: AdmissionFormType) => void
}

const StudentDetails = ({ application_id, onAdmissionCreation, handleNext }: studentBaseDetailsProps) => {
  const [applicationDetails, setApplicationDetails] = useState<CreateStudentAdmissionRequest>()
  const [dob, setDob] = useState<Date>()

  const { triggerToast } = useToast()
  const { setLoading } = useLoader()

  const { data: occupationsList } = useGetOccupationsListQuery()
  const { data: communities } = useGetCommunitiesListQuery()
  const { data: religions } = useGetReligionsListQuery()
  const { data: qualifiedExams } = useGetQualifiedExamsListQuery()

  const [createUpdateAdmission, { isLoading: IsupdatingAdmission }] = useCreateUpdateAdmissionMutation()
  const [fetchApplicationDetail, { isLoading: isApplicationLoading }] = useLazyGetAdmissionDetailQuery()

  const showLoader = isApplicationLoading

  setLoading(showLoader)

  const handleChange =
    (prop: keyof CreateStudentAdmissionRequest) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event
      setApplicationDetails(prev => ({ ...prev, [prop]: value }))
    }

  useEffect(() => {
    let apl_id
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      apl_id = queryParams.get('id') ?? application_id
    }
    if (apl_id) {
      fetchApplicationDetail(apl_id).then(({ data: res }) => {
        setApplicationDetails(res)
        setDob(convertDateStringToDate(res?.dob))
      })
    }
  }, [])

  const handleSubmit = () => {
    let finalData = { ...applicationDetails }

    if (applicationDetails) {
      if (application_id) finalData.application_id = application_id
      createUpdateAdmission({
        ...finalData,
        dob: dateToString(dob, DateFormats.YearMonthDate) ?? ''
      })
        .unwrap()
        .then(({ application_id, message }) => {
          if (application_id) {
            handleNext(AdmissionFormType.ADDON_COURSE)
          }
          triggerToast(message ?? 'New application created', { variant: ToastVariants.SUCCESS })
        })
        .catch(res => triggerToast(res.data, { variant: ToastVariants.ERROR }))
    }
  }

  const fields: InputFields[] = [
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
              <small>{label}</small>
              <TextField
                fullWidth
                id={id}
                value={value}
                defaultValue={value}
                type={variant}
                placeholder={placeholder ?? ''}
                onChange={onChange}
              />
              {caption && <small>{caption}</small>}
            </>
          ) : type === InputTypes.SELECT ? (
            <FormControl fullWidth>
              <small>{label}</small>
              <Select id={id} value={value ?? ''} onChange={onChange}>
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
            </FormControl>
          ) : type === InputTypes.RADIO ? (
            <Grid item xs={12}>
              <FormControl required>
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
              </FormControl>
            </Grid>
          ) : type === InputTypes.DATE ? (
            <Grid item xs={12}>
              <Box display='flex' flexDirection='column'>
                <small>Date of Birth</small>
                <DatePicker selected={dob} customInput={customInput} id={id} onChange={onChange} />
              </Box>
            </Grid>
          ) : null}
        </Grid>
      )
    )

  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          {renderInputFields()}

          <Grid item xs={12}>
            <LoadingButton
              loading={IsupdatingAdmission}
              variant='contained'
              sx={{ marginRight: 3.5 }}
              onClick={handleSubmit}
            >
              Save and continue
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default StudentDetails
