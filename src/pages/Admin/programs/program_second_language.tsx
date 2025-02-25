import { Button, Checkbox, FormControlLabel, FormGroup, Grid, Typography } from '@mui/material'
import { Box } from '@muiElements'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useGetLanguagesListQuery } from 'src/store/services/listServices'
import {
  useLazyGetProgramSecondLanguagesListQuery,
  useUpdateProgramSecondLanguagesListMutation
} from 'src/store/services/programServices'

const ProgramSecondLanguage = ({ program_id }: { program_id: string }) => {
  const [fetchProgramSecondLanguages, { data: programSecondLanguages }] = useLazyGetProgramSecondLanguagesListQuery()
  const { data: languagesList } = useGetLanguagesListQuery()

  const [updateProgramSecondLanguages] = useUpdateProgramSecondLanguagesListMutation()
  const { triggerToast } = useToast()
  const [prgLangIds, setPrgLangIds] = useState<Set<string>>(new Set())
  const [initialPrgLangIds, setInitialPrgLangIds] = useState<Set<string>>(new Set())
  const [isEdited, setIsEdited] = useState(false)

  useEffect(() => {
    fetchProgramSecondLanguages(program_id)
  }, [program_id])

  useEffect(() => {
    const newLangIds = new Set(programSecondLanguages?.map(each => each.language_id) ?? [])
    setPrgLangIds(newLangIds)
    setInitialPrgLangIds(new Set(newLangIds))
    setIsEdited(false)
  }, [programSecondLanguages])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrgLangIds(prevIds => {
      const newIds = new Set(prevIds)
      e.target.checked ? newIds.add(e.target.id) : newIds.delete(e.target.id)

      setIsEdited(!areSetsEqual(newIds, initialPrgLangIds))

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
    updateProgramSecondLanguages({ program_id, languages: [...prgLangIds] })
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  return (
    <Box padding='1rem'>
      <Typography variant='h6' marginBottom='1rem'>
        Program Second languages
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
                    checked={prgLangIds.has(each.languages_id)}
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

export default ProgramSecondLanguage
