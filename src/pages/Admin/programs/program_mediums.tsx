import { Button, Checkbox, FormControlLabel, FormGroup, Grid, Typography } from '@mui/material'
import { Box } from '@muiElements'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useGetLanguagesListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramMediumsListQuery, useUpdateProgramMediumsMutation } from 'src/store/services/programServices'

const ProgramMediums = ({ program_id }: { program_id: string }) => {
  const [fetchProgramMediums, { data: programMediums }] = useLazyGetProgramMediumsListQuery()
  const { data: languagesList } = useGetLanguagesListQuery()

  const [updateProgramMediums] = useUpdateProgramMediumsMutation()
  const { triggerToast } = useToast()
  const [prgMediumIds, setPrgMediumIds] = useState<Set<string>>(new Set())
  const [initialPrgMediumIds, setInitialPrgMediumIds] = useState<Set<string>>(new Set())
  const [isEdited, setIsEdited] = useState(false)

  useEffect(() => {
    fetchProgramMediums(program_id)
  }, [program_id])

  useEffect(() => {
    const newLangIds = new Set(programMediums?.map(each => each.language_id) ?? [])
    setPrgMediumIds(newLangIds)
    setInitialPrgMediumIds(new Set(newLangIds))
    setIsEdited(false)
  }, [programMediums])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrgMediumIds(prevIds => {
      const newIds = new Set(prevIds)
      e.target.checked ? newIds.add(e.target.id) : newIds.delete(e.target.id)

      setIsEdited(!areSetsEqual(newIds, initialPrgMediumIds))
      return new Set(newIds)
    })
  }

  const areSetsEqual = (set1: Set<string>, set2: Set<string>) => {
    if (set1.size !== set2.size) return false
    for (let item of set1) {
      if (!set2.has(item)) return false
    }
    return true
  }

  const handleSubmit = () => {
    updateProgramMediums({ program_id, languages: [...prgMediumIds] })
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        setInitialPrgMediumIds(prgMediumIds)
        setIsEdited(false)
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  return (
    <Box padding='1rem'>
      <Typography variant='h6' marginBottom='1rem'>
        Program Mediums
      </Typography>
      <FormGroup>
        <Grid container spacing={2}>
          {languagesList?.map(each => (
            <Grid item sm={12} md={6}>
              <FormControlLabel
                key={each.languages_id}
                control={
                  <Checkbox
                    id={each.languages_id}
                    onChange={handleChange}
                    checked={prgMediumIds.has(each.languages_id)}
                  />
                }
                label={each.languages_name}
              />
            </Grid>
          ))}
        </Grid>
        {isEdited && <Button onClick={() => handleSubmit()}>Update Changes</Button>}
      </FormGroup>
    </Box>
  )
}

export default ProgramMediums
