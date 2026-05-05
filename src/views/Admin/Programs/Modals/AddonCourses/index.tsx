import { Box, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import { Button, Grid } from '@muiElements'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import GetChaarvyIcons from 'src/utils/icons'

import {
  AddOnCourseProps,
  MediumNode,
  PreviousProgramAddonCourse,
  ProgramAddonCourseModalProps,
  SegmentNode
} from './types'
import { useAddonCourseModal } from './useAddonCourseModal'
import { toggleButtonSx } from './utils'

const defaultData: AddOnCourseProps[] = [
  {
    program_id: 'p1',
    program_name: 'Program 1',
    program_segments: [
      {
        segment_id: 's1',
        segment_name: 'Segment 1',
        segment_mediums: [
          { medium_id: 'm1', medium_name: 'Medium 1' },
          { medium_id: 'm2', medium_name: 'Medium 2' }
        ]
      },
      {
        segment_id: 's2',
        segment_name: 'Segment 2',
        segment_mediums: [
          { medium_id: 'm3', medium_name: 'Medium 3' },
          { medium_id: 'm4', medium_name: 'Medium 4' }
        ]
      }
    ]
  },
  {
    program_id: 'p2',
    program_name: 'Program 2',
    program_segments: [
      {
        segment_id: 's3',
        segment_name: 'Segment 3',
        segment_mediums: [
          { medium_id: 'm5', medium_name: 'Medium 5' },
          { medium_id: 'm6', medium_name: 'Medium 6' }
        ]
      }
    ]
  }
]

const previousData: PreviousProgramAddonCourse[] = [
  {
    program_addon_course_id: 'pac1',
    course_id: 'c1',
    program_id: 'p1',
    segment_id: 's1',
    medium_id: 'm1',
    capacity: 30
  },
  {
    program_addon_course_id: 'pac2',
    course_id: 'c1',
    program_id: 'p1',
    segment_id: 's2',
    medium_id: 'm3',
    capacity: 20
  }
]

const ProgramAddonCourseModal = ({ isOpen, onClose, course_id, course_name }: ProgramAddonCourseModalProps) => {
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
    handleCourseNameChange
  } = useAddonCourseModal({ isOpen, course_id, course_name, data: defaultData, previousData })

  const [isEditingCourseName, setIsEditingCourseName] = useState(course_name ? false : true)

  const renderMediums = (mediums: MediumNode[]) => {
    return mediums.map(medium => {
      const mediumChecked = selectedMediumKeys.has(medium.key)
      const capacityValue = mediumFieldValues[medium.key]?.capacity ?? ''
      const feesValue = mediumFieldValues[medium.key]?.fees ?? ''
      const isCapacityInvalid = capacityValue.trim() === '' || Number(capacityValue || 0) < 0
      const isFeesInvalid = feesValue.trim() === '' || Number(feesValue || 0) < 0

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
                  label='Seating Capacity'
                  type='number'
                  required
                  value={capacityValue}
                  onChange={event => handleFieldChange(medium.key, 'capacity', event.target.value)}
                  error={isCapacityInvalid}
                  inputProps={{ min: 0 }}
                  sx={{ width: 150 }}
                />
                <TextField
                  size='small'
                  label='Fees'
                  type='number'
                  required
                  value={feesValue}
                  onChange={event => handleFieldChange(medium.key, 'fees', event.target.value)}
                  error={isFeesInvalid}
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
    console.log('Addon Courses Changeset:', preparedApiPayload)
    console.log('  Course Update:', preparedApiPayload.course_update)
    console.log('  Upsert:', preparedApiPayload.upsert)
    console.log('  Removed IDs:', preparedApiPayload.removed)
  }

  return (
    <ChaarvyModal
      title='Add-On Courses'
      isOpen={isOpen}
      onClose={onClose}
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
      <Box sx={{ maxHeight: '70vh', overflowY: 'auto', px: 0.5, pb: 0.5 }}>
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

        {programNodes.map(program => {
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
        })}
      </Box>
    </ChaarvyModal>
  )
}

export default ProgramAddonCourseModal
