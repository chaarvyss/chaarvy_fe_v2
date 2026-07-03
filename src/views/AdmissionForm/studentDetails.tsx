import { LoadingButton } from '@mui/lab'
import { Box, Card } from '@mui/material'
import { useEffect, useMemo } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { getMandatoryFieldsList, useFormBuilder } from 'src/hooks/useFormBuilder'
import { InputTypes, InputVariants } from 'src/lib/enums'
import FormGenerator from 'src/reusable_components/formGenerator'
import 'react-datepicker/dist/react-datepicker.css'
import {
  useGetStudentDetailsFormTwoQuery,
  useUpdateStudentDetailsF2Mutation
} from 'src/store/services/admisissionsService'
import {
  useGetCommunitiesListQuery,
  useGetOccupationsListQuery,
  useGetQualifiedExamsListQuery,
  useGetReligionsListQuery
} from 'src/store/services/listServices'

import { AdmissionFormType } from '.'

const getLast10Years = (): number[] => {
  const currentYear = new Date().getFullYear()

  return Array.from({ length: 10 }, (_, i) => currentYear - i)
}

interface studentBaseDetailsProps {
  student_id?: string
  handleNext: (step: AdmissionFormType) => void
}

const StudentDetails = ({ student_id, handleNext }: studentBaseDetailsProps) => {
  const { triggerToast } = useToast()

  const { data: occupationsList } = useGetOccupationsListQuery()
  const { data: communities } = useGetCommunitiesListQuery()
  const { data: religions } = useGetReligionsListQuery()
  const { data: qualifiedExams } = useGetQualifiedExamsListQuery()
  const { data: applicationDetails } = useGetStudentDetailsFormTwoQuery(student_id ?? '', {
    skip: !student_id
  })

  const [updateStudentDetails, { isLoading: isSavingDetails }] = useUpdateStudentDetailsF2Mutation()

  const studentDetailConfig: FieldConfig<StudentDetailsRequest>[] = useMemo(
    () => [
      {
        key: 'qualified_exam',
        label: 'Qualified Exam',
        type: InputTypes.SELECT,
        rules: [],
        staticOptions: qualifiedExams,

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.qualified_exam_name,
            value: s.qualified_exam_id
          })) ?? []
      },
      { key: 'qualified_exam_hallticket_no', label: 'Hall ticket number', type: InputTypes.INPUT, rules: [] },
      {
        key: 'qualified_exam_year_of_pass',
        label: 'Year of pass',
        type: InputTypes.SELECT,
        rules: [],
        staticOptions: getLast10Years(),

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: `${s}`,
            value: `${s}`
          })) ?? []
      },
      { key: 'father_name', label: 'Father Name', type: InputTypes.INPUT, rules: [] },
      {
        key: 'father_occupation',
        label: 'Father Occupation',
        type: InputTypes.SELECT,
        rules: [],
        staticOptions: occupationsList,

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.occupation_name,
            value: s.occupation_id
          })) ?? []
      },

      { key: 'mother_name', label: 'Mother Name', type: InputTypes.INPUT, rules: [] },
      {
        key: 'mother_occupation',
        label: 'Mother Occupation',
        type: InputTypes.SELECT,
        rules: [],
        staticOptions: occupationsList,

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.occupation_name,
            value: s.occupation_id
          })) ?? []
      },

      {
        key: 'contact_no_2',
        variant: InputVariants.NUMBER,
        label: 'Alternative number',
        type: InputTypes.INPUT,
        rules: ['mobile']
      },

      {
        key: 'father_aadhar',
        label: 'Father Aadhar',
        type: InputTypes.INPUT,
        variant: InputVariants.NUMBER,
        rules: ['aadhar']
      },
      {
        key: 'mother_aadhar',
        label: 'Mother Aadhar',
        type: InputTypes.INPUT,
        variant: InputVariants.NUMBER,
        rules: ['aadhar']
      },
      {
        key: 'religion',
        label: 'Religion',
        type: InputTypes.SELECT,
        rules: [],
        staticOptions: religions,

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.religion_name,
            value: s.religion_id
          })) ?? []
      },
      {
        key: 'community',
        label: 'Caste / Community',
        type: InputTypes.SELECT,
        rules: [],
        staticOptions: communities,

        mapOptions: (data: any[]) =>
          data?.map(s => ({
            label: s.community_name,
            value: s.community_id
          })) ?? []
      },

      { key: 'subcaste', label: 'Sub caste', type: InputTypes.INPUT, rules: [] }
    ],
    [occupationsList, qualifiedExams, communities, religions]
  )

  const { fields, errors, handleSubmit, setValues } = useFormBuilder<StudentDetailsRequest>({
    formConfig: studentDetailConfig,
    initialValues: {
      student_id: student_id,
      qualified_exam: '',
      qualified_exam_year_of_pass: '',
      father_occupation: '',
      mother_occupation: '',
      contact_no_2: '',
      father_aadhar: '',
      mother_aadhar: '',
      religion: '',
      community: '',
      subcaste: ''
    }
  })

  useEffect(() => {
    if (applicationDetails) {
      setValues(applicationDetails)
    }
  }, [applicationDetails])

  const onSubmit = async (data: StudentDetailsRequest) => {
    updateStudentDetails({ ...data, student_id })
      .unwrap()
      .then(() => {
        handleNext(AdmissionFormType.ADDRESS)
        triggerToast('Student details Updated', { variant: ToastVariants.SUCCESS })
      })
      .catch(res => triggerToast(res.data, { variant: ToastVariants.ERROR }))
  }

  const isLoading = false

  return (
    <Card sx={{ p: 5 }}>
      <FormGenerator
        fields={fields}
        errors={errors}
        mandatoryFields={getMandatoryFieldsList(studentDetailConfig)}
        isLoading={isLoading}
      />
      <Box display='flex' justifyContent='flex-end' alignContent='end'>
        <LoadingButton
          disabled={errors.length > 0}
          fullWidth={false}
          variant='outlined'
          loading={isSavingDetails}
          onClick={handleSubmit(onSubmit)}
        >
          Save and continue
        </LoadingButton>
      </Box>
    </Card>
  )
}

export default StudentDetails
