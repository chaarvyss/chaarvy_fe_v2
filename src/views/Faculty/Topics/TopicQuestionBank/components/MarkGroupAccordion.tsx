import { Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material'

import { Box, Typography, Chip } from '@muiElements'
import { ChaarvyButton } from 'src/reusable_components'
import { Medium } from 'src/store/services/admisissionsService'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import { MarkGroup, Question } from '../types'

import { QuestionAccordion } from './QuestionAccordion'

interface MarkGroupAccordionProps {
  group: MarkGroup
  mediums?: Medium[]
  englishMediumId: string
  isTranslating: string | null
  onEditGroup: (group: MarkGroup) => void
  onDeleteGroup: (groupId: string) => void
  onAddQuestion: (groupId: string, type: 'mcq' | 'theory') => void
  onTranslateQuestion: (groupId: string, qIndex: number, q: Question) => void
  onDeleteQuestion: (groupId: string, qIndex: number) => void
  onSaveQuestion: (groupId: string, qIndex: number) => void
  isSavingQuestion: (groupId: string, qIndex: number) => boolean
  updateTitle: (groupId: string, qIndex: number, mediumId: string, val: string) => void
  updateOption: (groupId: string, qIndex: number, mediumId: string, optIndex: number, val: string) => void
  updateAnswer: (groupId: string, qIndex: number, mediumId: string, val: string) => void
}

export const MarkGroupAccordion = ({
  group,
  mediums,
  englishMediumId,
  isTranslating,
  onEditGroup,
  onDeleteGroup,
  onAddQuestion,
  onTranslateQuestion,
  onDeleteQuestion,
  onSaveQuestion,
  isSavingQuestion,
  updateTitle,
  updateOption,
  updateAnswer
}: MarkGroupAccordionProps) => {
  return (
    <Accordion
      sx={{
        mb: 2,
        borderRadius: '12px !important',
        '&:before': { display: 'none' },
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <AccordionSummary
        expandIcon={<GetChaarvyIcons iconName={ChaarvyIcon.ChevronDown} />}
        sx={{
          p: 2,
          px: 3,
          '&.Mui-expanded': { borderBottom: '1px solid rgba(0,0,0,0.05)' }
        }}
      >
        <Box display='flex' justifyContent='space-between' alignItems='center' width='100%' mr={2}>
          <Box display='flex' alignItems='center' gap={2}>
            <Typography variant='h6' color='primary.main'>
              {group.title}
            </Typography>
            <Chip
              label={`${group.marks} Marks Each`}
              sx={{ bgcolor: 'rgba(118, 75, 162, 0.1)', color: '#764ba2', fontWeight: 600, borderRadius: 1.5 }}
            />
          </Box>
          <Box display='flex' gap={1} onClick={e => e.stopPropagation()}>
            <IconButton size='small' onClick={() => onEditGroup(group)}>
              <GetChaarvyIcons color='warning' fontSize='1.25rem' iconName={ChaarvyIcon.PencilOutline} />
            </IconButton>
            <IconButton size='small' onClick={() => onDeleteGroup(group.id)}>
              <GetChaarvyIcons color='error' fontSize='1.25rem' iconName={ChaarvyIcon.TrashCanOutline} />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 4, bgcolor: '#fff' }}>
        {group.questions.map((q, qIndex) => (
          <QuestionAccordion
            key={q.id || `q-${qIndex}`}
            question={q}
            qIndex={qIndex}
            groupId={group.id}
            mediums={mediums}
            englishMediumId={englishMediumId}
            isTranslating={isTranslating === `${group.id}-${qIndex}`}
            isSaving={isSavingQuestion(group.id, qIndex)}
            onTranslate={() => onTranslateQuestion(group.id, qIndex, q)}
            onDelete={() => onDeleteQuestion(group.id, qIndex)}
            onSave={() => onSaveQuestion(group.id, qIndex)}
            updateTitle={updateTitle}
            updateOption={updateOption}
            updateAnswer={updateAnswer}
          />
        ))}

        <Box display='flex' gap={2} mt={3}>
          <ChaarvyButton
            variant='contained'
            color='primary'
            size='small'
            onClick={() => onAddQuestion(group.id, 'mcq')}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            + Add MCQ
          </ChaarvyButton>
          <ChaarvyButton
            variant='contained'
            color='secondary'
            size='small'
            onClick={() => onAddQuestion(group.id, 'theory')}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            + Add Theory
          </ChaarvyButton>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
