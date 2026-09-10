import { Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material'

import { Box, Typography, Grid, TextField, MenuItem, Chip } from '@muiElements'
import { ChaarvyButton } from 'src/reusable_components'
import { Medium } from 'src/store/services/admisissionsService'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import { Question } from '../types'

interface QuestionAccordionProps {
  question: Question
  qIndex: number
  groupId: string
  mediums?: Medium[]
  englishMediumId: string
  isTranslating: boolean
  isSaving: boolean
  onTranslate: () => void
  onDelete: () => void
  onSave: () => void
  updateTitle: (groupId: string, qIndex: number, mediumId: string, val: string) => void
  updateOption: (groupId: string, qIndex: number, mediumId: string, optIndex: number, val: string) => void
  updateAnswer: (groupId: string, qIndex: number, mediumId: string, val: string) => void
}

export const QuestionAccordion = ({
  question: q,
  qIndex,
  groupId,
  mediums,
  englishMediumId,
  isTranslating,
  isSaving,
  onTranslate,
  onDelete,
  onSave,
  updateTitle,
  updateOption,
  updateAnswer
}: QuestionAccordionProps) => {
  return (
    <Accordion
      sx={{
        mb: 3,
        borderRadius: '8px !important',
        '&:before': { display: 'none' },
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.08)',
        overflow: 'hidden',
        bgcolor: '#fafafa'
      }}
    >
      <AccordionSummary
        expandIcon={<GetChaarvyIcons iconName={ChaarvyIcon.ChevronDown} />}
        sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <Box display='flex' justifyContent='space-between' alignItems='center' width='100%' pr={2}>
          <Box display='flex' alignItems='center' gap={1}>
            <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
              Q{qIndex + 1}.
            </Typography>
            <Typography variant='body2' color='text.secondary' noWrap sx={{ maxWidth: 300 }}>
              {q.question_title?.[englishMediumId] || 'New Question'}
            </Typography>
            <Chip size='small' label={q.ui_type?.toUpperCase() || 'QUESTION'} sx={{ fontSize: '0.7em', height: 20 }} />
            <Chip
              size='small'
              label={q.id ? 'Saved' : 'Draft'}
              color={q.id ? 'success' : 'warning'}
              variant='outlined'
              sx={{ fontSize: '0.65em', height: 18, fontWeight: 600 }}
            />
          </Box>
          <Box display='flex' gap={1.5} alignItems='center' onClick={e => e.stopPropagation()}>
            <ChaarvyButton
              size='small'
              variant='outlined'
              color='primary'
              disabled={isTranslating || !q.question_title?.[englishMediumId]}
              onClick={onTranslate}
              sx={{ textTransform: 'none', py: 0.5 }}
            >
              {isTranslating ? <CircularProgress size={16} /> : '🌍 Auto-Translate'}
            </ChaarvyButton>
            <ChaarvyButton
              size='small'
              variant='contained'
              color='primary'
              disabled={isSaving}
              onClick={onSave}
              sx={{ textTransform: 'none', py: 0.5, px: 2, minWidth: 70 }}
            >
              {isSaving ? <CircularProgress size={16} color='inherit' /> : q.id ? 'Update' : 'Save'}
            </ChaarvyButton>
            <ChaarvyButton size='small' color='error' onClick={onDelete} sx={{ minWidth: 'auto', p: 0.5 }}>
              Remove
            </ChaarvyButton>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3, bgcolor: '#fff' }}>
        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: 'white' }}>
          <Typography variant='subtitle2' mb={2} color='primary.main'>
            Question Title
          </Typography>
          <Grid container spacing={3} mb={3}>
            {mediums?.map(medium => (
              <Grid item xs={12} sm={6} key={`title-${medium.medium_id}`}>
                <TextField
                  fullWidth
                  label={`Question Text (${medium.medium_name || medium.medium_id})`}
                  value={q.question_title?.[medium.medium_id] || ''}
                  onChange={e => updateTitle(groupId, qIndex, medium.medium_id, e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
            ))}
          </Grid>

          {q.ui_type === 'mcq' && (
            <>
              <Typography variant='subtitle2' mb={2} color='primary.main'>
                Options
              </Typography>
              {Array.from({ length: 4 }).map((_, optIndex) => (
                <Box key={`opt-${optIndex}`} mb={3} p={2} sx={{ border: '1px dashed #e0e0e0', borderRadius: 2 }}>
                  <Typography variant='caption' fontWeight={600} display='block' mb={2}>
                    Option {optIndex + 1}
                  </Typography>
                  <Grid container spacing={3}>
                    {mediums?.map(medium => {
                      const optValue = q.options?.[medium.medium_id]?.[optIndex] || ''
                      const isCorrect = q.correct_option?.[medium.medium_id] === optValue && optValue !== ''

                      return (
                        <Grid item xs={12} sm={6} key={`opt-${optIndex}-${medium.medium_id}`}>
                          <TextField
                            fullWidth
                            size='small'
                            label={`Option ${optIndex + 1} (${medium.medium_name})`}
                            value={optValue}
                            onChange={e => updateOption(groupId, qIndex, medium.medium_id, optIndex, e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: isCorrect ? '#e8f5e9' : 'transparent'
                              }
                            }}
                          />
                        </Grid>
                      )
                    })}
                  </Grid>
                </Box>
              ))}

              <Typography variant='subtitle2' mt={3} mb={2} color='primary.main'>
                Correct Answer
              </Typography>
              <Grid container spacing={3}>
                {mediums?.map(medium => (
                  <Grid item xs={12} sm={6} key={`correct-${medium.medium_id}`}>
                    <TextField
                      select
                      fullWidth
                      size='small'
                      label={`Correct Answer (${medium.medium_name})`}
                      value={q.correct_option?.[medium.medium_id] || ''}
                      onChange={e => updateAnswer(groupId, qIndex, medium.medium_id, e.target.value)}
                    >
                      {(q.options?.[medium.medium_id] || ['', '', '', '']).map((opt, optIdx) => (
                        <MenuItem key={optIdx} value={opt}>
                          {opt || `Option ${optIdx + 1}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          <Box display='flex' justifyContent='flex-end' gap={2} mt={3}>
            <ChaarvyButton
              variant='contained'
              color='primary'
              size='small'
              disabled={isSaving}
              onClick={onSave}
              sx={{ textTransform: 'none', px: 3, borderRadius: 1.5 }}
            >
              {isSaving ? <CircularProgress size={16} color='inherit' /> : q.id ? 'Update Question' : 'Save Question'}
            </ChaarvyButton>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
