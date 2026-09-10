import { Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material'
import { useState, useEffect } from 'react'

import { Box, Typography, Grid, TextField, MenuItem, Chip } from '@muiElements'
import { ChaarvyButton, ChaarvyModal } from 'src/reusable_components'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'
import { Medium } from 'src/store/services/admisissionsService'
import { useGetQuestionTypesQuery, useGetQuestionsQuery } from 'src/store/services/facultyServices'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

type Question = {
  id?: string
  topic_id: string
  question_title: { [key: string]: string }
  options?: { [key: string]: string[] }
  correct_option?: { [key: string]: string }
  question_type: string
  ui_type?: 'mcq' | 'theory'
}

type MarkGroup = {
  id: string
  title: string
  marks: number
  questions: Question[]
}

interface Topic {
  program: string
  segment: string
  subject: string
  topic_id: string
  topic_name: string
}

const TopicQuestionBank = ({ topic, onBack, mediums }: { topic: Topic; onBack: () => void; mediums?: Medium[] }) => {
  const { data: questionTypes } = useGetQuestionTypesQuery()

  const { data: questions } = useGetQuestionsQuery(
    {
      program_id: topic.program,
      segment_id: topic.segment,
      subject_id: topic.subject,
      topic_id: topic.topic_id
    },
    {
      skip: !topic.program || !topic.segment || !topic.subject || !topic.topic_id
    }
  )

  const [markGroups, setMarkGroups] = useState<MarkGroup[]>([])

  useEffect(() => {
    // Check if questions is an array directly, or nested inside a data/questions property
    const questionList = Array.isArray(questions)
      ? questions
      : (questions as any)?.data || (questions as any)?.questions

    if (questionList && Array.isArray(questionList)) {
      const groupsMap = new Map<string, MarkGroup>()

      questionList.forEach((q: any) => {
        // Find type info if available, otherwise use fallbacks
        const qTypeInfo = questionTypes ? questionTypes.find((qt: any) => qt.id === q.question_type) : null

        if (!groupsMap.has(q.question_type)) {
          groupsMap.set(q.question_type, {
            id: q.question_type,
            title: qTypeInfo?.question_type || 'Unknown Type',
            marks: qTypeInfo?.marks || 1,
            questions: []
          })
        }

        groupsMap.get(q.question_type)?.questions.push({
          ...q,
          ui_type: q.options && Object.keys(q.options).length > 0 ? 'mcq' : 'theory'
        })
      })

      setMarkGroups(Array.from(groupsMap.values()))
    }
  }, [questions, questionTypes])

  const [isGroupModalOpen, setGroupModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [groupID, setgroupID] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'group'; id: string } | { type: 'question'; groupId: string; qIndex: number } | null
  >(null)

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'group') {
      deleteMarkGroup(deleteTarget.id)
    } else {
      deleteQuestion(deleteTarget.groupId, deleteTarget.qIndex)
    }
    setDeleteTarget(null)
  }

  const handleOpenGroupModal = (group?: MarkGroup) => {
    if (group) {
      setEditingGroupId(group.id)
      setgroupID(group.id)
    } else {
      setEditingGroupId(null)
      setgroupID('')
    }
    setGroupModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!groupID.trim() || !questionTypes) return

    const questionType = questionTypes.find(each => each.id === groupID)

    if (editingGroupId) {
      setMarkGroups(
        markGroups.map(mg =>
          mg.id === editingGroupId
            ? { ...mg, title: questionType?.question_type ?? '', marks: questionType?.marks ?? 1 }
            : mg
        )
      )
    } else {
      // Check if group already exists
      if (!markGroups.find(mg => mg.id === groupID)) {
        setMarkGroups([
          ...markGroups,
          {
            id: groupID,
            title: questionType?.question_type ?? '',
            marks: questionType?.marks ?? 1,
            questions: []
          }
        ])
      }
    }

    setgroupID('')
    setEditingGroupId(null)
    setGroupModalOpen(false)
  }

  const deleteMarkGroup = (id: string) => {
    setMarkGroups(markGroups.filter(mg => mg.id !== id))
  }

  const addQuestion = (groupId: string, type: 'mcq' | 'theory') => {
    setMarkGroups(
      markGroups.map(mg => {
        if (mg.id === groupId) {
          const newQ: Question = {
            topic_id: topic.topic_id,
            question_type: groupId,
            question_title: {},
            ui_type: type,
            ...(type === 'mcq' ? { options: {}, correct_option: {} } : {})
          }

          mediums?.forEach(m => {
            newQ.question_title[m.medium_id] = ''
            if (type === 'mcq') {
              newQ.options![m.medium_id] = ['', '', '', '']
              newQ.correct_option![m.medium_id] = ''
            }
          })

          return { ...mg, questions: [...mg.questions, newQ] }
        }

        return mg
      })
    )
  }

  const deleteQuestion = (groupId: string, qIndex: number) => {
    setMarkGroups(
      markGroups.map(mg => {
        if (mg.id === groupId) {
          return { ...mg, questions: mg.questions.filter((_, idx) => idx !== qIndex) }
        }

        return mg
      })
    )
  }

  const updateQuestionTitle = (groupId: string, qIndex: number, mediumId: string, val: string) => {
    setMarkGroups(
      markGroups.map(mg => {
        if (mg.id === groupId) {
          return {
            ...mg,
            questions: mg.questions.map((q, idx) => {
              if (idx === qIndex) {
                return { ...q, question_title: { ...q.question_title, [mediumId]: val } }
              }

              return q
            })
          }
        }

        return mg
      })
    )
  }

  const updateQuestionOption = (groupId: string, qIndex: number, mediumId: string, optIndex: number, val: string) => {
    setMarkGroups(
      markGroups.map(mg => {
        if (mg.id === groupId) {
          return {
            ...mg,
            questions: mg.questions.map((q, idx) => {
              if (idx === qIndex) {
                const newOpts = { ...(q.options || {}) }
                const arr = [...(newOpts[mediumId] || ['', '', '', ''])]
                arr[optIndex] = val
                newOpts[mediumId] = arr

                return { ...q, options: newOpts }
              }

              return q
            })
          }
        }

        return mg
      })
    )
  }

  const updateQuestionAnswer = (groupId: string, qIndex: number, mediumId: string, val: string) => {
    setMarkGroups(
      markGroups.map(mg => {
        if (mg.id === groupId) {
          return {
            ...mg,
            questions: mg.questions.map((q, idx) => {
              if (idx === qIndex) {
                return { ...q, correct_option: { ...q.correct_option, [mediumId]: val } }
              }

              return q
            })
          }
        }

        return mg
      })
    )
  }

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
        <Accordion
          key={group.id}
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
                <IconButton size='small' onClick={() => handleOpenGroupModal(group)}>
                  <GetChaarvyIcons color='warning' fontSize='1.25rem' iconName={ChaarvyIcon.PencilOutline} />
                </IconButton>
                <IconButton size='small' onClick={() => setDeleteTarget({ type: 'group', id: group.id })}>
                  <GetChaarvyIcons color='error' fontSize='1.25rem' iconName={ChaarvyIcon.TrashCanOutline} />
                </IconButton>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 4, bgcolor: '#fff' }}>
            {group.questions.map((q, qIndex) => (
              <Box
                key={q.id || `q-${qIndex}`}
                sx={{
                  mb: 4,
                  p: 3,
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 3,
                  bgcolor: '#fafafa',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }
                }}
              >
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
                  <Typography variant='subtitle1' fontWeight={600} color='text.primary'>
                    Q{qIndex + 1}.{' '}
                    <Box component='span' sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85em' }}>
                      ({q.ui_type?.toUpperCase() || 'QUESTION'})
                    </Box>
                  </Typography>
                  <ChaarvyButton
                    size='small'
                    color='error'
                    onClick={() => setDeleteTarget({ type: 'question', groupId: group.id, qIndex })}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    Remove
                  </ChaarvyButton>
                </Box>

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
                          onChange={e => updateQuestionTitle(group.id, qIndex, medium.medium_id, e.target.value)}
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
                        <Box
                          key={`opt-${optIndex}`}
                          mb={3}
                          p={2}
                          sx={{ border: '1px dashed #e0e0e0', borderRadius: 2 }}
                        >
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
                                    onChange={e =>
                                      updateQuestionOption(group.id, qIndex, medium.medium_id, optIndex, e.target.value)
                                    }
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
                              label={`Correct Answer (${medium.medium_name} )`}
                              value={q.correct_option?.[medium.medium_id] || ''}
                              onChange={e => updateQuestionAnswer(group.id, qIndex, medium.medium_id, e.target.value)}
                            >
                              {(q.options?.[medium.medium_id] || ['', '', '', '']).map((opt, optIndex) => (
                                <MenuItem key={optIndex} value={opt}>
                                  {opt || `Option ${optIndex + 1}`}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Box>
              </Box>
            ))}

            <Box display='flex' gap={2} mt={3}>
              <ChaarvyButton
                variant='contained'
                color='primary'
                size='small'
                onClick={() => addQuestion(group.id, 'mcq')}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
              >
                + Add MCQ
              </ChaarvyButton>
              <ChaarvyButton
                variant='contained'
                color='secondary'
                size='small'
                onClick={() => addQuestion(group.id, 'theory')}
                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
              >
                + Add Theory
              </ChaarvyButton>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box display='flex' justifyContent='center' mt={2}>
        <ChaarvyButton
          variant='outlined'
          color='primary'
          onClick={() => handleOpenGroupModal()}
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
    </Box>
  )
}

export default TopicQuestionBank
