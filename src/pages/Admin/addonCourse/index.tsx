import { LoadingButton } from '@mui/lab'
import { Check, Close, Pencil } from 'mdi-material-ui'
import React, { useState } from 'react'

import {
  Box,
  Button,
  Card,
  Grid,
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
import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { TableHeaders } from 'src/lib/interfaces'
import { AddOnCourse } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import Tag from 'src/reusable_components/tag'
import {
  useCreateAddonCourseMutation,
  useUpdateAddonCourseMutation,
  useUpdateAddonCourseStatusMutation
} from 'src/store/services/adminServices'
import { useGetAddonCoursesListQuery } from 'src/store/services/listServices'

const FeesTypes = () => {
  const { data: addonCourses, isLoading } = useGetAddonCoursesListQuery(false)
  const [isAddonCourseModalOpen, setIsAddonCourseModalOpen] = useState<boolean>(false)
  const [selectedAddonCourse, setSelectedAddonCourse] = useState<AddOnCourse>()

  const [addonCourseName, setAddonCourseName] = useState<string>()

  const [updateAddonCourseStatus, { isLoading: isCourseStatusUpdating }] = useUpdateAddonCourseStatusMutation()
  const [createAddonCourse, { isLoading: isCourseCreating }] = useCreateAddonCourseMutation()
  const [updateAddonCourse, { isLoading: isCourseUpdating }] = useUpdateAddonCourseMutation()

  const { triggerToast } = useToast()

  const { setLoading } = useLoader()

  setLoading(isLoading || isCourseStatusUpdating)

  const handleOnModalClose = () => {
    setSelectedAddonCourse(undefined)
    setIsAddonCourseModalOpen(false)
    setAddonCourseName(undefined)
  }

  const handleAddFees = () => {
    setIsAddonCourseModalOpen(true)
  }

  const headers: TableHeaders[] = [
    { label: 'S#' },
    { label: 'Course Name' },
    { label: 'Status' },
    { label: 'Action', width: '200px' }
  ]

  const handleSubmit = () => {
    if (!addonCourseName) return

    const action = selectedAddonCourse
      ? updateAddonCourse({ id: selectedAddonCourse.addon_course_id, addon_course_name: addonCourseName })
      : createAddonCourse(addonCourseName)

    action
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
        handleOnModalClose()
      })
      .catch(e => triggerToast(e.data, { variant: ToastVariants.ERROR }))
  }

  const createProgramFooter = () => {
    return (
      <Box display='flex' justifyContent='center'>
        <LoadingButton loading={isCourseCreating || isCourseUpdating} onClick={handleSubmit} variant='contained'>
          Create Addon Course
        </LoadingButton>
      </Box>
    )
  }

  const getTextInputField = () => {
    return (
      <TextField
        onChange={e => setAddonCourseName(e.target.value)}
        value={addonCourseName}
        fullWidth
        id='addon_program_name'
        label='Addon program name'
      />
    )
  }

  const handleEditClick = (addonCourse: AddOnCourse) => {
    setAddonCourseName(addonCourse.addon_course_name)
    setSelectedAddonCourse(addonCourse)
  }

  const createAddonCourseModal = () => {
    return (
      <ChaarvyModal
        isOpen={isAddonCourseModalOpen}
        onClose={handleOnModalClose}
        title='Create Addon course'
        footer={createProgramFooter()}
        shouldWarnOnClose
        shouldRestrictCloseOnOuterClick
      >
        <Grid sm={12} md={8} lg={6} gap={2}>
          {getTextInputField()}
        </Grid>
      </ChaarvyModal>
    )
  }

  const isEditMode = (id: string) => {
    return selectedAddonCourse?.addon_course_id == id
  }

  return (
    <>
      {createAddonCourseModal()}
      <TableTilteHeader
        isButtonDisabled={!!selectedAddonCourse}
        title='Addon Courses'
        buttonTitle='Add Addon Course'
        onButtonClick={handleAddFees}
      />
      <Card>
        {(addonCourses ?? []).length > 0 ? (
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
                {(addonCourses ?? []).map((eachBook: AddOnCourse, index) => (
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {isEditMode(eachBook.addon_course_id) ? getTextInputField() : eachBook?.addon_course_name}
                    </TableCell>
                    <TableCell>
                      <Tag
                        status={eachBook?.status}
                        onClick={() => updateAddonCourseStatus(eachBook.addon_course_id)}
                      />
                    </TableCell>
                    <TableCell>
                      {isEditMode(eachBook.addon_course_id) ? (
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
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>No Addon courses Available</Typography>
          </Box>
        )}
      </Card>
    </>
  )
}

export default FeesTypes
