import { Button, SelectChangeEvent } from '@mui/material'
import { ChangeEvent, useState } from 'react'

import { Box, Card, Grid, Typography } from '@muiElements'
import { InputTypes } from 'src/lib/enums'
import { FilterProps } from 'src/lib/interfaces'
import { InputFields } from 'src/lib/types'
import RenderInputFields from 'src/reusable_components/renderInputFields'
import { ImgStyled } from 'src/reusable_components/styledComponents/styledImgTag'
import { useGetProgramsListQuery, useLazyGetStudentsListQuery } from 'src/store/services/listServices'
import {
  useLazyGetProgramMediumsListQuery,
  useLazyGetProgramSectionListQuery
} from 'src/store/services/programServices'

const TOP_LEVEL_ID = 'get-attendence'

const GetAttendence = () => {
  const [filterProps, setFilterProps] = useState<FilterProps>()
  const [getSectionsList, { data: sections }] = useLazyGetProgramSectionListQuery()
  const { data: programsList } = useGetProgramsListQuery(true)
  const [getMediumsList, { data: mediums }] = useLazyGetProgramMediumsListQuery()
  const [getStudentsList, { data: studentsList, isFetching }] = useLazyGetStudentsListQuery()

  const [attended, setAttended] = useState<Array<string>>([])

  const getDependentData = value => {
    getSectionsList(value)
    getMediumsList(value)
  }

  const handleChange =
    (prop: keyof FilterProps) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event

      setFilterProps(prev => ({ ...prev, [prop]: value }))

      if (prop === 'program') {
        getDependentData(value)
      }
    }

  const shouldDisableGetStudents = () => {
    if (!filterProps) {
      return true
    }

    return ['program', 'medium', 'section'].some(key => filterProps[key] === undefined || filterProps[key] === '')
  }

  const getStudents = () => {
    if (filterProps) {
      getStudentsList(filterProps)
    }
  }

  const fields: InputFields[] = [
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__program`,
      label: 'Program',
      key: 'program',
      value: filterProps?.program,
      onChange: handleChange('program'),
      menuOptions: (programsList ?? []).map(each => {
        return { value: each.program_id, label: each.program_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__section`,
      label: 'Medium',
      key: 'medium',
      value: filterProps?.medium,
      onChange: handleChange('medium'),
      menuOptions: (mediums ?? []).map(each => {
        return { value: each.language_id, label: each.language_name }
      })
    },
    {
      type: InputTypes.SELECT,
      id: `${TOP_LEVEL_ID}__section`,
      label: 'Section',
      key: 'section',
      value: filterProps?.section,
      onChange: handleChange('section'),
      menuOptions: (sections ?? []).map(each => {
        return { value: each.section_id, label: each.section_name }
      })
    },
    {
      type: InputTypes.BUTTON,
      id: `${TOP_LEVEL_ID}__button`,
      label: 'Get Students',
      key: 'getStudents',
      isDisabled: shouldDisableGetStudents(),
      value: '',
      onChange: () => getStudents()
    }
  ]

  const handleAttendance = (id: string) => setAttended(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id]))

  const studentCardTile = () => {
    if (isFetching) return <Typography>Loading</Typography>

    return (studentsList ?? []).map(each => (
      <Grid key={each.application_id} item xs={12} md={3} xl={2}>
        <Card
          onClick={() => handleAttendance(each.application_id)}
          sx={{
            cursor: 'pointer',
            bgcolor: attended.includes(each.application_id) ? '#a8f89c' : ''
          }}
        >
          <Box display='flex' justifyContent='center' alignItems='center' gap={3} flexDirection='column' padding={3}>
            <ImgStyled src={each.photo_url ?? '/images/avatars/1.png'} alt='add photo' style={{ cursor: 'pointer' }} />
            <Typography variant='body1'>{each.student_name}</Typography>
          </Box>
        </Card>
      </Grid>
    ))
  }

  const handleRecordAttendence = () => {
    alert('under progress')
    console.log(attended)
  }

  return (
    <>
      <Typography variant='h5' textAlign='center' marginBottom={2}>
        Attendence
      </Typography>
      <Box display='flex' justifyContent='end' marginBottom={2}>
        <Typography>
          {attended.length} / {(studentsList ?? []).length} students attended
        </Typography>
      </Box>
      <Card sx={{ padding: '1rem' }}>
        <RenderInputFields fields={fields} mandatoryFields={[]} errors={[]} />
      </Card>
      <Grid spacing={3} container marginTop={4}>
        {studentCardTile()}
      </Grid>
      <Box display='flex' justifyContent='end' alignItems='center'>
        <Button onClick={handleRecordAttendence} disabled={!studentsList} variant='contained' size='small'>
          Record Attendence
        </Button>
      </Box>
    </>
  )
}

export default GetAttendence
