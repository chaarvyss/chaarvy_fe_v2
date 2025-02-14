import { MenuItem, Select, TextField } from '@mui/material'
import { Box, Button, FormControl, Grid, InputLabel } from '@muiElements'
import { ChangeEvent, useEffect, useState } from 'react'
import { Program } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

export interface CreateProgram {
  program_name: string
}

interface CreateUpdateProgramProps {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

const CreateOrUpdateProgramModal = ({ selectedProgram, isOpen, onClose }: CreateUpdateProgramProps) => {
  const createProgramFooter = () => {
    return (
      <Box display='flex' justifyContent='center'>
        <Button variant='contained'>{selectedProgram ? 'Edit' : 'Create'} Program</Button>
      </Box>
    )
  }

  const [programDetails, setProgramDetails] = useState<CreateProgram>({
    program_name: ''
  })

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

  return (
    <ChaarvyModal
      isOpen={isOpen}
      onClose={resetProgramDetails}
      title={`${selectedProgram ? 'Edit' : 'Create'} Program`}
      footer={createProgramFooter()}
      shouldWarnOnClose
      shouldRestrictCloseOnOuterClick
    >
      <Grid sm={12} md={8} lg={6} gap={2}>
        <TextField
          onChange={handleChange('program_name')}
          value={programDetails.program_name}
          fullWidth
          id='program_name'
          label='Program name'
          sx={{ marginBottom: 4 }}
        />
      </Grid>
    </ChaarvyModal>
  )
}

export default CreateOrUpdateProgramModal
