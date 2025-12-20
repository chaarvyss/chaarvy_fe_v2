import React, { useState } from 'react'

import { Check, Close, Pencil } from '@mdiElements'
import {
  Box,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { TableHeaders } from 'src/lib/interfaces'
import { Language } from 'src/lib/types'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useCreateLanguageMutation, useUpdateLangugageMutation } from 'src/store/services/adminServices'
import { useGetLanguagesListQuery } from 'src/store/services/listServices'

const Languages = () => {
  const { data: languagesData } = useGetLanguagesListQuery()

  const [isAddingNewLanguage, setIsAddingNewLanguage] = useState<boolean>(false)
  const [languageId, setLanguageId] = useState<string>()
  const [newLanguageName, setNewLaguageName] = useState<string>()

  const { triggerToast } = useToast()

  const headers: TableHeaders[] = [{ label: 's#' }, { label: 'Language Name' }, { label: 'Actions', width: '100px' }]

  const handleNewLanguageAdding = () => {
    setIsAddingNewLanguage(true)
  }

  const [createLanguageApi] = useCreateLanguageMutation()
  const [updateLanguageApi] = useUpdateLangugageMutation()

  const handleEditLanguage = (language: Language) => {
    setLanguageId(language.languages_id)
    setNewLaguageName(language.languages_name)
  }

  const handleCloseEdit = () => {
    setNewLaguageName(undefined)
    setIsAddingNewLanguage(false)
    setLanguageId(undefined)
  }

  const handleUpdate = () => {
    let apiResponse
    if (isAddingNewLanguage) {
      apiResponse = createLanguageApi(newLanguageName as string)
    } else {
      apiResponse = updateLanguageApi({ id: languageId, language_name: newLanguageName })
    }

    apiResponse
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        handleCloseEdit()
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  const getInputField = () => {
    return <TextField value={newLanguageName} onChange={e => setNewLaguageName(e.target.value)} />
  }

  return (
    <>
      <TableTilteHeader
        title='Languages'
        buttonTitle='Add Language'
        isButtonDisabled={!!languageId}
        onButtonClick={handleNewLanguageAdding}
      />
      <Card>
        {(languagesData ?? []).length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map(each => (
                    <TableCell style={each.width ? { width: each.width } : {}}>{each.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(languagesData ?? []).map((eachBook: Language, index) => (
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {languageId == eachBook.languages_id ? getInputField() : eachBook?.languages_name}
                    </TableCell>
                    <TableCell>
                      {languageId == eachBook.languages_id ? (
                        <Box display='flex'>
                          <IconButton onClick={handleCloseEdit}>
                            <Close color='error' />
                          </IconButton>
                          <IconButton onClick={handleUpdate}>
                            <Check color='success' />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton disabled={isAddingNewLanguage} onClick={() => handleEditLanguage(eachBook)}>
                          <Pencil />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {isAddingNewLanguage && (
                  <TableRow>
                    <TableCell>{(languagesData?.length ?? 0) + 1}</TableCell>
                    <TableCell>
                      <TextField value={newLanguageName} onChange={e => setNewLaguageName(e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <Box display='flex'>
                        <IconButton onClick={handleCloseEdit}>
                          <Close color='error' />
                        </IconButton>
                        <IconButton onClick={handleUpdate}>
                          <Check color='success' />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>No Languages Available</Typography>
          </Box>
        )}
      </Card>
    </>
  )
}

export default Languages
