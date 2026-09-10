import { Box, Typography, Grid, TextField } from '@muiElements'
import { ChaarvyButton, ChaarvyModal } from 'src/reusable_components'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'

interface QuestionBankModalsProps {
  isGroupModalOpen: boolean
  setGroupModalOpen: (open: boolean) => void
  editingGroupId: string | null
  groupID: string
  setgroupID: (id: string) => void
  handleSaveGroup: () => void
  questionTypes: any[] | undefined
  deleteTarget: { type: 'group'; id: string } | { type: 'question'; groupId: string; qIndex: number } | null
  setDeleteTarget: (target: any) => void
  confirmDelete: () => void
}

export const QuestionBankModals = ({
  isGroupModalOpen,
  setGroupModalOpen,
  editingGroupId,
  groupID,
  setgroupID,
  handleSaveGroup,
  questionTypes,
  deleteTarget,
  setDeleteTarget,
  confirmDelete
}: QuestionBankModalsProps) => {
  return (
    <>
      {isGroupModalOpen && (
        <ChaarvyModal
          shouldRestrictCloseOnOuterClick
          isOpen={isGroupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          title={editingGroupId ? 'Edit Mark Group' : 'Add New Mark Group'}
          modalSize='col-11 col-md-4'
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='caption'>Group Title</Typography>
              <ChaarvySelect
                label='Question Type'
                placeholder='Select Question Type'
                value={questionTypes?.find(each => each.id === groupID)?.id}
                onChange={(e: any) => setgroupID(e.target.value)}
                options={questionTypes?.map(qt => ({ label: qt.question_type, value: qt.id })) || []}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='caption'>Marks Each Question</Typography>
              <TextField
                type='number'
                size='small'
                disabled
                value={questionTypes?.find(each => each.id === groupID)?.marks ?? 0}
                fullWidth
                placeholder='e.g., 2'
              />
            </Grid>
            <Grid item xs={12} display='flex' justifyContent='flex-end' gap={2} mt={2}>
              <ChaarvyButton size='small' variant='outlined' color='error' onClick={() => setGroupModalOpen(false)}>
                Cancel
              </ChaarvyButton>
              <ChaarvyButton
                variant='contained'
                size='small'
                color='primary'
                onClick={handleSaveGroup}
                disabled={!groupID.trim()}
              >
                {editingGroupId ? 'Update Group' : 'Save Group'}
              </ChaarvyButton>
            </Grid>
          </Grid>
        </ChaarvyModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ChaarvyModal
          shouldRestrictCloseOnOuterClick
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title='Confirm Deletion'
          modalSize='col-3'
        >
          <Box p={2} textAlign='center'>
            <Typography variant='body1' mb={3}>
              Are you sure you want to delete this{' '}
              {deleteTarget.type === 'group' ? 'mark group and all its questions' : 'question'}? This action cannot be
              undone.
            </Typography>
            <Box display='flex' justifyContent='space-between' gap={2}>
              <ChaarvyButton variant='outlined' onClick={() => setDeleteTarget(null)}>
                Cancel
              </ChaarvyButton>
              <ChaarvyButton variant='contained' color='error' onClick={confirmDelete}>
                Delete
              </ChaarvyButton>
            </Box>
          </Box>
        </ChaarvyModal>
      )}
    </>
  )
}
