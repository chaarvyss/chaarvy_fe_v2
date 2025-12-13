import { Button, Checkbox, FormControlLabel, FormGroup, Grid, Typography } from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'

import { Box } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useGetSectionsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramSectionListQuery, useUpdateProgramSectionMutation } from 'src/store/services/programServices'
import { areSetsEqual } from 'src/utils/helpers'

const ProgramSection = ({ program_id }: { program_id: string }) => {
  const [fetchProgramSection, { data: ProgramSection }] = useLazyGetProgramSectionListQuery()
  const { data: sectionsList } = useGetSectionsListQuery()

  const [updateProgramSection] = useUpdateProgramSectionMutation()
  const { triggerToast } = useToast()
  const [prgSectionIds, setPrgSectionIds] = useState<Set<string>>(new Set())
  const [initialPrgSectionIds, setInitialPrgSectionIds] = useState<Set<string>>(new Set())
  const [isEdited, setIsEdited] = useState(false)

  useEffect(() => {
    fetchProgramSection(program_id)
  }, [program_id])

  useEffect(() => {
    const newLangIds = new Set(ProgramSection?.map(each => each.section_id) ?? [])
    setPrgSectionIds(newLangIds)
    setInitialPrgSectionIds(new Set(newLangIds))
    setIsEdited(false)
  }, [ProgramSection])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrgSectionIds(prevIds => {
      const newIds = new Set(prevIds)
      e.target.checked ? newIds.add(e.target.id) : newIds.delete(e.target.id)

      setIsEdited(!areSetsEqual(newIds, initialPrgSectionIds))

      return new Set(newIds)
    })
  }

  const handleSubmit = () => {
    updateProgramSection({ program_id, sections: Array.from(prgSectionIds).filter(e => e !== undefined) })
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        setInitialPrgSectionIds(prgSectionIds)
        setIsEdited(false)
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  return (
    <Box padding='1rem'>
      <Typography variant='h6' marginBottom='1rem'>
        Program Sections
      </Typography>
      <FormGroup>
        <Grid container spacing={2}>
          {sectionsList?.map(each => (
            <Grid item sm={12} md={6}>
              <FormControlLabel
                key={each.section_id}
                control={
                  <Checkbox
                    id={each.section_id}
                    onChange={handleChange}
                    checked={prgSectionIds.has(each?.section_id ?? '')}
                  />
                }
                label={each.section_name}
              />
            </Grid>
          ))}
        </Grid>
        {isEdited && <Button onClick={() => handleSubmit()}>Update Changes</Button>}
      </FormGroup>
    </Box>
  )
}

export default ProgramSection
