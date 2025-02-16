import { TextField } from '@mui/material'
import { Box, Button, Grid, InputLabel } from '@muiElements'
import { ChangeEvent, useEffect, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Fees } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useCreateFeesTypeMutation, useUpdateFeesTypeMutation } from 'src/store/services/adminServices'

export interface CreateFeesType {
  fees_type: string
}

interface CreateUpdateFeesTypeProps {
  selectedFeesType?: Fees
  isOpen: boolean
  onClose: () => void
}

const CreateOrUpdateFeesTypeModal = ({ selectedFeesType, isOpen, onClose }: CreateUpdateFeesTypeProps) => {
  const [FeesTypeDetails, setFeesTypeDetails] = useState<CreateFeesType>({
    fees_type: ''
  })
  const { triggerToast } = useToast()
  const [CreateFeesType] = useCreateFeesTypeMutation()
  const [updateFeesType] = useUpdateFeesTypeMutation()

  const resetState = () => {
    setFeesTypeDetails({ fees_type: '' })
  }

  const handleSubmit = () => {
    if (selectedFeesType) {
      updateFeesType({ fees_type: FeesTypeDetails.fees_type, id: selectedFeesType.fees_type_id })
        .unwrap()
        .then(response => {
          resetState()
          triggerToast(response, { variant: ToastVariants.SUCCESS })
          onClose()
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    } else {
      CreateFeesType(FeesTypeDetails.fees_type)
        .unwrap()
        .then(response => {
          resetState()
          triggerToast(response, { variant: ToastVariants.SUCCESS })
          onClose()
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  const createFeesTypeFooter = () => {
    return (
      <Box display='flex' justifyContent='center'>
        <Button onClick={handleSubmit} variant='contained'>
          {selectedFeesType ? 'Edit' : 'Create'}
        </Button>
      </Box>
    )
  }

  useEffect(() => {
    setFeesTypeDetails({
      fees_type: selectedFeesType?.fees_type ?? ''
    })
  }, [selectedFeesType])

  const handleChange = (prop: keyof CreateFeesType) => (event: ChangeEvent<HTMLInputElement>) => {
    setFeesTypeDetails({ ...FeesTypeDetails, [prop]: event.target.value })
  }

  const resetFeesTypeDetails = () => {
    setFeesTypeDetails({ fees_type: '' })
    onClose()
  }

  return (
    <ChaarvyModal
      isOpen={isOpen}
      onClose={resetFeesTypeDetails}
      title={`${selectedFeesType ? 'Edit' : 'Create'} Fees type`}
      footer={createFeesTypeFooter()}
      shouldWarnOnClose
      shouldRestrictCloseOnOuterClick
    >
      <Grid sm={12} md={8} lg={6} gap={2}>
        <TextField
          onChange={handleChange('fees_type')}
          value={FeesTypeDetails.fees_type}
          fullWidth
          id='fees_type'
          label='Fees Type'
          sx={{ marginBottom: 4 }}
        />
      </Grid>
    </ChaarvyModal>
  )
}

export default CreateOrUpdateFeesTypeModal
