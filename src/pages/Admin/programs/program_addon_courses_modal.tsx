import { IconButton, SelectChangeEvent, TextField, Typography } from '@mui/material'
import { FormControl, Input, InputLabel, MenuItem, Select } from '@mui/material'
import { Pencil } from 'mdi-material-ui'
import React, { useEffect, useState } from 'react'

import { Check, Close } from '@mdiElements'
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { TableHeaders } from 'src/lib/interfaces'
import { ProgramAddonCourseResponse, Program, AddOnCourse } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import {
  CreateProgramAddonRequest,
  useCreateProgramAddonMutation,
  useUpdateAddonCourseMutation,
  useUpdateProgramAddonMutation
} from 'src/store/services/adminServices'
import { CreateProgramAddonCourseRequest } from 'src/store/services/feesServices'
import { useGetAddonCoursesListQuery, useLazyGetProgramsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramAddonListQuery } from 'src/store/services/programServices'

interface ProgramFeesDetailsProps {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

const ProgramAddonCourseModal = ({ selectedProgram, isOpen, onClose }: ProgramFeesDetailsProps) => {
  const { triggerToast } = useToast()

  const [isCreateProgramAddonModalOpen, setIsCreateProgramAddonModalOpen] = useState<boolean>(false)
  const [addonCourseDetail, setAddonCourseDetail] = useState<ProgramAddonCourseResponse>()

  const [createAddonCourseDetails, setCreateAddonCourseDetails] = useState<CreateProgramAddonRequest>({
    program_id: '',
    addon_course_id: '',
    fees: 0
  })

  const [fetchProgramsList, { data: programsList }] = useLazyGetProgramsListQuery()
  const { data: addonCourseList } = useGetAddonCoursesListQuery(true)

  const [fetchProgramAddonCourseList, { data: programAddonCourses }] = useLazyGetProgramAddonListQuery()
  const [createProgramAddon] = useCreateProgramAddonMutation()
  const [updateProgramAddon] = useUpdateProgramAddonMutation()

  const onCreateProgramAddonClick = () => {
    setCreateAddonCourseDetails({ ...createAddonCourseDetails, program_id: selectedProgram?.program_id ?? '' })
    fetchProgramsList(true)
    setIsCreateProgramAddonModalOpen(true)
  }
  useEffect(() => {
    fetchProgramAddonCourseList(selectedProgram?.program_id ?? '')
  }, [selectedProgram])

  const headers: TableHeaders[] = [
    { label: 's#' },
    { label: 'Addon course' },
    { label: 'Course Fees' },
    { label: 'Actions', width: '200px' }
  ]

  const handleProgramAddonModal = () => {
    setCreateAddonCourseDetails({
      program_id: '',
      addon_course_id: '',
      fees: 0
    })
    setIsCreateProgramAddonModalOpen(false)
  }

  const handleOnModalClose = () => {
    handleProgramAddonModal()
    setAddonCourseDetail(undefined)
  }

  const handleCreateProgramFeesDetalilsUpdate =
    (prop: keyof CreateProgramAddonCourseRequest) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
      setCreateAddonCourseDetails({ ...createAddonCourseDetails, [prop]: event.target.value })
    }

  const isCreateProgramFeesButtonDisabled = (): boolean => {
    return Object.values(createAddonCourseDetails).some(value => value === '' || value === 0)
  }

  const handleSubmit = () => {
    const action = addonCourseDetail?.program_addon_course_id
      ? updateProgramAddon({ ...createAddonCourseDetails, id: addonCourseDetail?.program_addon_course_id })
      : createProgramAddon(createAddonCourseDetails)

    action
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        handleOnModalClose()
      })
      .catch(e => triggerToast(e.data, { variant: ToastVariants.ERROR }))
  }

  const createProgramAddonCourseModal = () => {
    return (
      <ChaarvyModal
        shouldRestrictCloseOnOuterClick
        shouldWarnOnClose
        onClose={handleOnModalClose}
        isOpen={isCreateProgramAddonModalOpen}
        title='Add Addon Course'
      >
        <Box gap='1rem'>
          <FormControl fullWidth>
            <InputLabel>Program</InputLabel>
            <Select
              required
              label='Program'
              disabled={!!selectedProgram}
              onChange={handleCreateProgramFeesDetalilsUpdate('program_id')}
              value={createAddonCourseDetails.program_id}
            >
              {(programsList ?? []).map(each => (
                <MenuItem value={each.program_id}>{each.program_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className='mt-3'>
            <InputLabel>AddonCourse Type</InputLabel>
            <Select
              required
              label='AddonCourse Type'
              onChange={handleCreateProgramFeesDetalilsUpdate('addon_course_id')}
              value={createAddonCourseDetails.addon_course_id}
            >
              {(addonCourseList ?? []).map((each: AddOnCourse) => (
                <MenuItem value={each.addon_course_id}>{each.addon_course_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth className='mt-3'>
            <TextField
              required
              type='number'
              label='AddonCourse'
              value={createAddonCourseDetails.fees}
              onChange={handleCreateProgramFeesDetalilsUpdate('fees')}
            />
          </FormControl>
          <Box marginTop={4} display='flex' justifyContent='space-around' alignItems='center'>
            <Button onClick={handleOnModalClose} variant='outlined' color='error'>
              Cancel
            </Button>
            <Button variant='contained' disabled={isCreateProgramFeesButtonDisabled()} onClick={handleSubmit}>
              Create
            </Button>
          </Box>
        </Box>
      </ChaarvyModal>
    )
  }

  const handleEditClick = (each: ProgramAddonCourseResponse) => {
    setAddonCourseDetail(each)
    setCreateAddonCourseDetails({
      program_id: each.program_id,
      addon_course_id: each.addon_course_id,
      fees: each.addon_coures_fees
    })
  }

  const getEditFeesInput = () => {
    return (
      <TextField
        onChange={handleCreateProgramFeesDetalilsUpdate('fees')}
        value={createAddonCourseDetails.fees}
        fullWidth
        id='program_addon_fees_update'
        label='Fees'
      />
    )
  }

  const isEditMode = (id: string) => {
    return addonCourseDetail?.program_addon_course_id == id
  }

  return (
    <>
      <ChaarvyModal
        isOpen={isOpen}
        onClose={onClose}
        title={`${selectedProgram?.program_name} AddonCourse Details`}
        shouldRestrictCloseOnOuterClick
        modalSize='col-12 col-md-6'
      >
        {programAddonCourses ? (
          <>
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
                  {programAddonCourses.map((eachBook, index) => (
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{eachBook.addon_course_name}</TableCell>
                      <TableCell>
                        {isEditMode(eachBook.program_addon_course_id) ? getEditFeesInput() : eachBook.addon_coures_fees}
                      </TableCell>
                      <TableCell>
                        {isEditMode(eachBook.program_addon_course_id) ? (
                          <Box display='flex'>
                            <IconButton size='small' onClick={handleOnModalClose}>
                              <Close color='error' />
                            </IconButton>
                            <IconButton size='small' onClick={handleSubmit}>
                              <Check color='success' />
                            </IconButton>
                          </Box>
                        ) : (
                          <IconButton size='small' onClick={() => handleEditClick(eachBook)}>
                            <Pencil />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button onClick={onCreateProgramAddonClick}>Add More</Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button onClick={onCreateProgramAddonClick}>Add Book</Button>
          </Box>
        )}
      </ChaarvyModal>
      {createProgramAddonCourseModal()}
    </>
  )
}

export default ProgramAddonCourseModal
