import { SelectChangeEvent } from '@mui/material'
import { Box, Card, Grid, Typography } from '@muiElements'
import React, { ChangeEvent, useState } from 'react'
import { InputTypes } from 'src/lib/enums'
import { FilterProps } from 'src/lib/interfaces'
import { InputFields } from 'src/lib/types'
import RenderInputFields from 'src/reusable_components/renderInputFields'
import { ImgStyled } from 'src/reusable_components/styledComponents/styledImgTag'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramSectionListQuery } from 'src/store/services/programServices'

const TOP_LEVEL_ID = 'get-attendence'

const GetAttendence = () => {
  const [filterProps, setFilterProps] = useState<FilterProps>()

  const [getSectionsList, { data: sections }] = useLazyGetProgramSectionListQuery()
  const { data: programsList } = useGetProgramsListQuery(true)

  const getDependentData = value => {
    getSectionsList(value)
  }

  const handleChange =
    (prop: keyof FilterProps) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value ?? event

      setFilterProps(prev => ({ ...prev, [prop]: value }))

      if (prop === 'program') {
        getDependentData(value)
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
      label: 'Section',
      key: 'section',
      value: filterProps?.section,
      onChange: handleChange('section'),
      menuOptions: (sections ?? []).map(each => {
        return { value: each.section_id, label: each.section_name }
      })
    }
  ]

  const studentCardTile = (image?: string) => {
    return (
      <Grid item xs={12} md={4} xl={2}>
        <Card>
          <Box display='flex' justifyContent='center' alignItems='center' gap={3} flexDirection='column' padding={3}>
            <ImgStyled src={image ?? '/images/avatars/1.png'} alt='add photo' style={{ cursor: 'pointer' }} />
            <Typography>Student Name</Typography>
          </Box>
        </Card>
      </Grid>
    )
  }

  return (
    <>
      <RenderInputFields fields={fields} mandatoryFields={[]} errors={[]} />
      <Grid container>{studentCardTile()}</Grid>
    </>
  )
}

export default GetAttendence
