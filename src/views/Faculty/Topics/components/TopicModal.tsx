import { Typography, Grid, TextField } from '@muiElements'
import { ChaarvyButton, ChaarvyModal } from 'src/reusable_components'

type TopicModalProps = {
  isAddModalOpen: boolean
  setAddModalOpen: (open: boolean) => void
  editingTopicId: string | null
  topicDetails: any
  handleTopicChange: (value: string, key: string) => void
  handleSaveTopic: () => void
}

const TopicModal = ({
  isAddModalOpen,
  setAddModalOpen,
  editingTopicId,
  topicDetails,
  handleTopicChange,
  handleSaveTopic
}: TopicModalProps) => {
  if (!isAddModalOpen) return null

  return (
    <ChaarvyModal
      shouldRestrictCloseOnOuterClick
      isOpen={isAddModalOpen}
      onClose={() => setAddModalOpen(false)}
      title={editingTopicId ? 'Edit Topic' : 'Add New Topic'}
      modalSize='col-4'
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant='caption'>Topic Title</Typography>
          <TextField
            value={topicDetails.topic_name}
            size='small'
            onChange={e => handleTopicChange(e.target.value, 'topic_name')}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='caption'>Description (Optional)</Typography>
          <TextField
            multiline
            rows={3}
            value={topicDetails.description}
            onChange={e => handleTopicChange(e.target.value, 'description')}
            fullWidth
            variant='outlined'
          />
        </Grid>
        <Grid item xs={12} display='flex' justifyContent='flex-end' gap={2} mt={2}>
          <ChaarvyButton size='small' variant='outlined' color='error' onClick={() => setAddModalOpen(false)}>
            Cancel
          </ChaarvyButton>
          <ChaarvyButton
            variant='contained'
            size='small'
            color='primary'
            onClick={handleSaveTopic}
            disabled={!topicDetails.topic_name.trim()}
          >
            {editingTopicId ? 'Update Topic' : 'Save Topic'}
          </ChaarvyButton>
        </Grid>
      </Grid>
    </ChaarvyModal>
  )
}

export default TopicModal
