import { Box, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import { Button, Grid } from '@muiElements'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { ProgramAddonCourseRequest, useCreateUpdateProgramAddonCourseMutation } from 'src/store/services/adminServices'
import {
  useGetProgramAddonCoursesQuery,
  useGetProgramSegmentMediumSectionCombinationQuery
} from 'src/store/services/listServices'
import GetChaarvyIcons from 'src/utils/icons'

import { MediumNode, ProgramAddonCourseModalProps, SegmentNode } from './types'
import { useAddonCourseModal } from './useAddonCourseModal'
import { toggleButtonSx } from './utils'

const ProgramAddonCourseModal = ({ isOpen, onClose, addon_course }: ProgramAddonCourseModalProps) => {
  const { data: defaultData, isFetching: isFetchingDefaultData } = useGetProgramSegmentMediumSectionCombinationQuery()

  const { data: previousData, isFetching: isFetchingOldData } = useGetProgramAddonCoursesQuery(
    addon_course?.addon_course_id ?? '',
    {
      skip: !addon_course?.addon_course_id
    }
  )

  const [createUpdateProgramAddonCourse] = useCreateUpdateProgramAddonCourseMutation()

  const { addon_course_id: course_id, addon_course_name: course_name } = addon_course ?? {}

  const {
    programNodes,
    selectedMediumKeys,
    expandedPrograms,
    expandedSegments,
    mediumFieldValues,
    editableCourseName,
    preparedApiPayload,
    canSave,
    invalidSegmentKeys,
    invalidProgramKeys,
    getSelectionState,
    toggleProgram,
    toggleProgramExpanded,
    toggleSegment,
    toggleSegmentExpanded,
    toggleMedium,
    handleFieldChange,
    handleCourseNameChange,
    resetModalState
  } = useAddonCourseModal({ isOpen, course_id, course_name, data: defaultData ?? [], previousData: previousData ?? [] })

  const handleClose = () => {
    resetModalState()
    onClose()
  }

  const [isEditingCourseName, setIsEditingCourseName] = useState(course_name ? false : true)

  const renderMediums = (mediums: MediumNode[]) => {
    return mediums.map(medium => {
      const mediumChecked = selectedMediumKeys.has(medium.key)
      const seating_capacityValue = mediumFieldValues[medium.key]?.seating_capacity ?? ''
      const addon_course_feesValue = mediumFieldValues[medium.key]?.addon_course_fees ?? ''
      const isseating_capacityInvalid = seating_capacityValue.trim() === '' || Number(seating_capacityValue || 0) < 0
      const isaddon_course_feesInvalid = addon_course_feesValue.trim() === '' || Number(addon_course_feesValue || 0) < 0

      return (
        <Grid item sm={12} md={12} key={medium.key}>
          <Box
            sx={{
              ml: 8,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexWrap: 'wrap',
              borderLeft: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <FormControlLabel
              sx={{ m: 0, pl: 1.5 }}
              control={
                <Checkbox
                  id={medium.id}
                  onChange={event => toggleMedium(medium.key, event.target.checked)}
                  checked={mediumChecked}
                />
              }
              label={<Typography variant='body2'>{medium.name}</Typography>}
            />
            {mediumChecked ? (
              <ChaarvyFlex className={{ gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  size='small'
                  label='Seating capacity'
                  type='number'
                  required
                  value={seating_capacityValue}
                  onChange={event => handleFieldChange(medium.key, 'seating_capacity', event.target.value)}
                  error={isseating_capacityInvalid}
                  inputProps={{ min: 0 }}
                  sx={{ width: 150 }}
                />
                <TextField
                  size='small'
                  label='Fees'
                  type='number'
                  required
                  value={addon_course_feesValue}
                  onChange={event => handleFieldChange(medium.key, 'addon_course_fees', event.target.value)}
                  error={isaddon_course_feesInvalid}
                  inputProps={{ min: 0 }}
                  sx={{ width: 120 }}
                />
              </ChaarvyFlex>
            ) : null}
          </Box>
        </Grid>
      )
    })
  }

  const renderSegments = (segments: SegmentNode[]) => {
    return segments.map(segment => {
      const segmentSelection = getSelectionState(segment.mediumKeys)
      const isExpanded = expandedSegments[segment.key]
      const isSegmentMandatoryInvalid = invalidSegmentKeys.has(segment.key)

      return (
        <Box key={segment.key} sx={{ ml: 5.5, mt: 0.5, mb: 1, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
          <Grid item sm={12} md={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', py: 0.25 }}>
              <IconButton size='small' onClick={() => toggleSegmentExpanded(segment.key)} sx={toggleButtonSx}>
                {isExpanded ? '-' : '+'}
              </IconButton>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    id={segment.id}
                    onChange={event => toggleSegment(segment, event.target.checked)}
                    checked={segmentSelection.checked}
                    indeterminate={segmentSelection.indeterminate}
                  />
                }
                label={
                  <Typography variant='body2' color={isSegmentMandatoryInvalid ? 'error.main' : 'text.primary'}>
                    {segment.name}
                  </Typography>
                }
              />
            </Box>
          </Grid>
          {isExpanded ? renderMediums(segment.mediums) : null}
        </Box>
      )
    })
  }

  const handleSave = () => {
    const { course_update, upsert, removed } = preparedApiPayload

    const addon_course_id = addon_course?.addon_course_id
    const addon_course_name = course_update?.course_name ?? addon_course?.addon_course_name ?? ''

    const program_addon_courses = [
      ...upsert.map(each => ({
        ...each,
        addon_course_id
      })),
      ...removed.map(each => ({
        ...each,
        status: 0
      }))
    ]

    const payload = {
      addon_course_id,
      addon_course_name,
      status: 1,
      program_addon_courses
    } as ProgramAddonCourseRequest

    createUpdateProgramAddonCourse(payload)
  }

  const isLoading = isFetchingDefaultData || isFetchingOldData

  return (
    <ChaarvyModal
      title='Add-On Courses'
      isOpen={isOpen}
      onClose={handleClose}
      modalSize='col-12 col-md-10 col-lg-8 col-xl-6'
      footer={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, pb: 1 }}>
          <Typography variant='body2'>
            {preparedApiPayload.upsert.length} change{preparedApiPayload.upsert.length !== 1 ? 's' : ''}
            {preparedApiPayload.removed.length > 0 ? `, ${preparedApiPayload.removed.length} removed` : ''}
          </Typography>
          <Button variant='contained' onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </Box>
      }
    >
      <Box sx={{ maxHeight: '68vh', overflowY: 'auto', px: 0.5, pb: 0.5 }}>
        <Box sx={{ mb: 2 }}>
          <ChaarvyFlex className={{ justifyContent: 'flex-start', px: 4 }}>
            {isEditingCourseName ? (
              <TextField
                size='small'
                label='Course Name'
                sx={{ mb: 3, mt: 3 }}
                required
                value={editableCourseName}
                onChange={event => handleCourseNameChange(event.target.value)}
                error={editableCourseName.trim() === ''}
              />
            ) : (
              <Typography variant='h6'>{editableCourseName}</Typography>
            )}

            <IconButton onClick={() => setIsEditingCourseName(!isEditingCourseName)}>
              <GetChaarvyIcons
                iconName={isEditingCourseName ? 'Floppy' : 'Pencil'}
                color={isEditingCourseName ? 'green' : 'orange'}
                fontSize='1.25rem'
              />
            </IconButton>
          </ChaarvyFlex>
        </Box>

        {isLoading ? (
          <ChaarvyFlex className={{ height: '200px' }}>
            <Typography>Loading...</Typography>
          </ChaarvyFlex>
        ) : (
          programNodes.map(program => {
            const programSelection = getSelectionState(program.mediumKeys)
            const isProgramExpanded = expandedPrograms[program.key]
            const isProgramMandatoryInvalid = invalidProgramKeys.has(program.key)

            return (
              <Box
                key={program.key}
                sx={{
                  mb: 1.5,
                  p: 1.25,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'action.hover'
                }}
              >
                <Grid item sm={12} md={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 0.25 }}>
                    <IconButton size='small' onClick={() => toggleProgramExpanded(program.key)} sx={toggleButtonSx}>
                      {isProgramExpanded ? '-' : '+'}
                    </IconButton>
                    <FormControlLabel
                      sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: 15, fontWeight: 600 } }}
                      control={
                        <Checkbox
                          id={program.id}
                          onChange={event => toggleProgram(program, event.target.checked)}
                          checked={programSelection.checked}
                          indeterminate={programSelection.indeterminate}
                        />
                      }
                      label={
                        <Typography
                          variant='body1'
                          fontWeight={600}
                          color={isProgramMandatoryInvalid ? 'error.main' : 'text.primary'}
                        >
                          {program.name}
                        </Typography>
                      }
                    />
                  </Box>
                </Grid>
                {isProgramExpanded ? renderSegments(program.segments) : null}
              </Box>
            )
          })
        )}
      </Box>
    </ChaarvyModal>
  )
}

export default ProgramAddonCourseModal
