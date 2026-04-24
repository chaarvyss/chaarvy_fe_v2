import { Button, SelectChangeEvent } from '@mui/material'
import React, { ChangeEvent, useState } from 'react'

import {
  Box,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@muiElements'
import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Section, TableHeaders } from 'src/lib/interfaces'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/Table/TableTilteHeader'
import { useCreateUpdateSectionMutation } from 'src/store/services/adminServices'
import { useGetSectionsListQuery } from 'src/store/services/listServices'

const Sections = () => {
  const { data: sectionsList, isLoading } = useGetSectionsListQuery()
  const [isSectionModalOpen, setSectionModalOpen] = useState<boolean>(false)
  const [selectedSection, setSelectedSection] = useState<Section>()

  const [createUpdateSection, { isLoading: isCreating }] = useCreateUpdateSectionMutation()

  const { setLoading } = useLoader()

  const { triggerToast } = useToast()

  setLoading(isLoading || isCreating)

  const handleAddSection = () => {
    setSectionModalOpen(true)
  }

  const handleKebabOptionClick = (section: Section, option: 'Edit') => {
    setSelectedSection(section)
    switch (option) {
      case 'Edit':
        setSelectedSection(prev => ({
          section_id: prev?.section_id ?? '',
          section_name: prev?.section_name ?? ''
        }))
        setSectionModalOpen(true)
        break
    }
  }

  const handleModalClose = () => {
    setSectionModalOpen(false)
    setSelectedSection(undefined)
  }

  const handleSubmit = () => {
    selectedSection &&
      createUpdateSection(selectedSection)
        .unwrap()
        .then(res => {
          triggerToast(res, { variant: ToastVariants.SUCCESS })
          handleModalClose()
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
  }

  const getKebabOptions = (eachSection: Section) => {
    return [
      {
        id: '',
        label: 'Edit',
        onOptionClick: () => handleKebabOptionClick(eachSection, 'Edit')
      }
    ]
  }

  const handleChange =
    (prop: keyof Section) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const value = event?.target?.value
      setSelectedSection(prev => ({ ...prev, [prop]: value }))
    }

  const SectionModal = () => (
    <ChaarvyModal
      title='Section'
      isOpen={isSectionModalOpen}
      onClose={handleModalClose}
      shouldRestrictCloseOnOuterClick
    >
      <Grid container spacing={7}>
        <Grid item xs={12}>
          <Box display='flex' flexDirection='column'>
            <small>Section Name</small>
            <TextField
              autoFocus
              fullWidth
              onChange={handleChange('section_name')}
              value={selectedSection?.section_name}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display='flex' flexDirection='column'>
            <Button disabled={!selectedSection?.section_name} onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Grid>
      </Grid>
    </ChaarvyModal>
  )

  const headers: TableHeaders[] = [{ label: 'S#' }, { label: 'Section Name' }, { label: 'Action', width: '100px' }]

  return (
    <>
      {SectionModal()}
      <TableTilteHeader title='Sections' buttonTitle='Add Section' onButtonClick={handleAddSection} />
      <Card>
        {(sectionsList ?? []).length > 0 ? (
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
                {(sectionsList ?? []).map((eachBook: Section, index) => (
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{eachBook?.section_name}</TableCell>

                    <TableCell>
                      <DropDownMenu dropDownMenuOptions={getKebabOptions(eachBook)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>No Books Available</Typography>
          </Box>
        )}
      </Card>
    </>
  )
}

export default Sections
