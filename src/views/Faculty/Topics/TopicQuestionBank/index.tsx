import { Box, Typography } from '@muiElements'
import { ChaarvyButton } from 'src/reusable_components'
import { Medium } from 'src/store/services/admisissionsService'

import { MarkGroupAccordion } from './components/MarkGroupAccordion'
import { QuestionBankModals } from './components/QuestionBankModals'
import { useQuestionBank } from './hooks/useQuestionBank'
import { Topic } from './types'

const TopicQuestionBank = ({ topic, onBack, mediums }: { topic: Topic; onBack: () => void; mediums?: Medium[] }) => {
  const { markGroups, questionTypes, isTranslating, englishMediumId, modalState, handlers } = useQuestionBank(
    topic,
    mediums
  )

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.5s ease-in' }}>
      <Box
        mb={4}
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        gap={2}
        sx={{ p: 2, bgcolor: 'rgba(118, 75, 162, 0.05)', borderRadius: 2, borderLeft: '4px solid #764ba2' }}
      >
        <Typography variant='h5' fontWeight={700} color='text.primary'>
          {topic.topic_name} - Question Bank
        </Typography>
        <ChaarvyButton variant='outlined' onClick={onBack} size='small' sx={{ borderRadius: 2 }}>
          ← Back
        </ChaarvyButton>
      </Box>

      {markGroups.map(group => (
        <MarkGroupAccordion
          key={group.id}
          group={group}
          mediums={mediums}
          englishMediumId={englishMediumId}
          isTranslating={isTranslating}
          onEditGroup={handlers.handleOpenGroupModal}
          onDeleteGroup={groupId => modalState.setDeleteTarget({ type: 'group', id: groupId })}
          onAddQuestion={handlers.addQuestion}
          onTranslateQuestion={handlers.handleTranslateQuestion}
          onDeleteQuestion={(groupId, qIndex) => modalState.setDeleteTarget({ type: 'question', groupId, qIndex })}
          onSaveQuestion={handlers.handleSaveQuestion}
          isSavingQuestion={handlers.isSavingQuestion}
          updateTitle={handlers.updateQuestionTitle}
          updateOption={handlers.updateQuestionOption}
          updateAnswer={handlers.updateQuestionAnswer}
        />
      ))}

      <Box display='flex' justifyContent='center' mt={2}>
        <ChaarvyButton
          variant='outlined'
          color='primary'
          onClick={() => handlers.handleOpenGroupModal()}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 4,
            fontWeight: 600,
            borderStyle: 'dashed',
            borderWidth: 2,
            '&:hover': { borderWidth: 2 }
          }}
        >
          + Add New Mark Group
        </ChaarvyButton>
      </Box>

      <QuestionBankModals
        isGroupModalOpen={modalState.isGroupModalOpen}
        setGroupModalOpen={modalState.setGroupModalOpen}
        editingGroupId={modalState.editingGroupId}
        groupID={modalState.groupID}
        setgroupID={modalState.setgroupID}
        handleSaveGroup={handlers.handleSaveGroup}
        questionTypes={questionTypes}
        deleteTarget={modalState.deleteTarget}
        setDeleteTarget={modalState.setDeleteTarget}
        confirmDelete={handlers.confirmDelete}
      />
    </Box>
  )
}

export default TopicQuestionBank
