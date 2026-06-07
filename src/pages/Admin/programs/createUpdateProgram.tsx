'use client'

import { LoadingButton } from '@mui/lab'
import { Checkbox, FormControlLabel, TextField } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'

import { Box, Grid } from '@muiElements'
import { useLoader } from 'src/@core/context/loaderContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Program } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useCreateProgramMutation, useUpdateProgramMutation } from 'src/store/services/adminServices'
import { useGetSegmentsListQuery } from 'src/store/services/listServices'

export interface CreateProgram {
  program_name: string
}

interface CreateUpdateProgramProps {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

const CreateOrUpdateProgramModal = ({ selectedProgram, isOpen, onClose }: CreateUpdateProgramProps) => {
  const { setLoading } = useLoader()
  const [programDetails, setProgramDetails] = useState<CreateProgram>({
    program_name: ''
  })
  const { triggerToast } = useToast()
  const [CreateProgram, { isLoading: creatingProgram }] = useCreateProgramMutation()
  const [updateProgram, { isLoading: updatingProgram }] = useUpdateProgramMutation()

  const { data: segmentsData } = useGetSegmentsListQuery()

  const [segmentIds, setSegmentIds] = useState<string[]>([])
  const handleSubmit = () => {
    const action = selectedProgram
      ? updateProgram({ program_name: programDetails.program_name, id: selectedProgram.program_id })
      : CreateProgram({ program_name: programDetails.program_name, segment_ids: segmentIds })

    action
      .unwrap()
      .then(response => {
        selectedProgram && triggerToast(response, { variant: ToastVariants.SUCCESS })
        onClose()
        setSegmentIds([])
      })
      .catch(e => triggerToast(e.data, { variant: ToastVariants.ERROR }))
  }

  const createProgramFooter = () => {
    return (
      <Box display='flex' justifyContent='center'>
        <LoadingButton
          loading={creatingProgram || updatingProgram}
          disabled={!programDetails.program_name || segmentIds.length == 0}
          onClick={handleSubmit}
          variant='contained'
        >
          {selectedProgram ? 'Edit' : 'Create'} Program
        </LoadingButton>
      </Box>
    )
  }

  useEffect(() => {
    setProgramDetails({
      program_name: selectedProgram?.program_name ?? ''
    })
  }, [selectedProgram])

  const handleChange = (prop: keyof CreateProgram) => (event: ChangeEvent<HTMLInputElement>) => {
    setProgramDetails({ ...programDetails, [prop]: event.target.value })
  }

  const resetProgramDetails = () => {
    setProgramDetails({ program_name: '' })
    onClose()
  }

  const showLoader = creatingProgram || updatingProgram

  useEffect(() => {
    setLoading(showLoader)
  }, [showLoader])

  const handleSegmentIds = (id: string) => {
    setSegmentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(segmentId => segmentId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  return (
    <ChaarvyModal
      isOpen={isOpen}
      onClose={resetProgramDetails}
      title={`${selectedProgram ? 'Edit' : 'Create'} Program`}
      footer={createProgramFooter()}
      shouldWarnOnClose
      shouldRestrictCloseOnOuterClick
    >
      <>
        <Grid item sm={12} md={8} lg={6} gap={2}>
          <TextField
            onChange={handleChange('program_name')}
            value={programDetails.program_name}
            fullWidth
            id='program_name'
            label='Program name'
            sx={{ marginBottom: 4 }}
          />
        </Grid>
        {!selectedProgram &&
          (segmentsData ?? []).map(each => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={segmentIds.includes(each.segment_id)}
                    onChange={() => handleSegmentIds(each.segment_id)}
                  />
                }
                label={each.segment_name}
              />
            )
          })}
      </>
    </ChaarvyModal>
  )
}

export default CreateOrUpdateProgramModal
