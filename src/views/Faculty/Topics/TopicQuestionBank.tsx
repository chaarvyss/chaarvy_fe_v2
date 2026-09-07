import { Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material'
import { useState } from 'react'

import { Box, Typography, Grid, TextField, MenuItem, Chip } from '@muiElements'
import { ChaarvyButton, ChaarvyModal } from 'src/reusable_components'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

type Question = {
  id: string
  text: string
  type: 'mcq' | 'theory'
  options?: string[]
  answer?: string
}

type MarkGroup = {
  id: string
  title: string
  marks: number
  questions: Question[]
}

const TopicQuestionBank = ({ topic, onBack }: { topic: any; onBack: () => void }) => {
  const [markGroups, setMarkGroups] = useState<MarkGroup[]>([])

  const [isGroupModalOpen, setGroupModalOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [groupTitle, setGroupTitle] = useState('')
  const [groupMarks, setGroupMarks] = useState<number | ''>('')
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'group'; id: string } | { type: 'question'; groupId: string; qId: string } | null
  >(null)

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'group') {
      deleteMarkGroup(deleteTarget.id)
    } else {
      deleteQuestion(deleteTarget.groupId, deleteTarget.qId)
    }
    setDeleteTarget(null)
  }

  const handleOpenGroupModal = (group?: MarkGroup) => {
    if (group) {
      setEditingGroupId(group.id)
      setGroupTitle(group.title)
      setGroupMarks(group.marks)
    } else {
      setEditingGroupId(null)
      setGroupTitle('')
      setGroupMarks('')
    }
    setGroupModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!groupTitle.trim() || !groupMarks) return
    if (editingGroupId) {
      setMarkGroups(
        markGroups.map(mg => (mg.id === editingGroupId ? { ...mg, title: groupTitle, marks: Number(groupMarks) } : mg))
      )
    } else {
      setMarkGroups([
        ...markGroups,
        {
          id: `mg_${Date.now()}`,
          title: groupTitle,
          marks: Number(groupMarks),
          questions: []
        }
      ])
    }
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
            id: `q_${Date.now()}`,
            text: '',
            type,
            ...(type === 'mcq' ? { options: ['', '', '', ''], answer: '' } : {})
          }

          return { ...mg, questions: [...mg.questions, newQ] }
        }

        return mg
      })
    )
  }

  const deleteQuestion = (groupId: string, qId: string) => {
    setMarkGroups(
      markGroups.map(mg => {
        if (mg.id === groupId) {
          return { ...mg, questions: mg.questions.filter(q => q.id !== qId) }
        }

        return mg
      })
    )
  }

  const updateQuestion = (groupId: string, qId: string, updates: Partial<Question>) => {
    setMarkGroups(
      markGroups.map(mg => {
        if (mg.id === groupId) {
          return {
            ...mg,
            questions: mg.questions.map(q => (q.id === qId ? { ...q, ...updates } : q))
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
                key={q.id}
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
                      ({q.type.toUpperCase()})
                    </Box>
                  </Typography>
                  <ChaarvyButton
                    size='small'
                    color='error'
                    onClick={() => setDeleteTarget({ type: 'question', groupId: group.id, qId: q.id })}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    Remove
                  </ChaarvyButton>
                </Box>

                <TextField
                  fullWidth
                  label='Question Text'
                  value={q.text}
                  onChange={e => updateQuestion(group.id, q.id, { text: e.target.value })}
                  multiline
                  rows={2}
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2 } }}
                />

                {q.type === 'mcq' && (
                  <Grid container spacing={3}>
                    {q.options?.map((opt, optIndex) => (
                      <Grid item xs={12} sm={6} key={optIndex}>
                        <TextField
                          fullWidth
                          size='small'
                          value={opt}
                          onChange={e => {
                            const newOpts = [...(q.options || [])]
                            newOpts[optIndex] = e.target.value
                            updateQuestion(group.id, q.id, { options: newOpts })
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: q.answer && opt === q.answer ? '#c1ffc6ff' : 'white',
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        size='small'
                        label='Correct Answer'
                        value={q.answer}
                        onChange={e => updateQuestion(group.id, q.id, { answer: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2 } }}
                      >
                        {q.options?.map((opt, optIndex) => (
                          <MenuItem key={optIndex} value={opt}>
                            {opt || '-'}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                )}
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
              <TextField
                value={groupTitle}
                size='small'
                onChange={e => setGroupTitle(e.target.value)}
                fullWidth
                placeholder='e.g., Multiple Choice Questions'
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='caption'>Marks Each Question</Typography>
              <TextField
                type='number'
                size='small'
                value={groupMarks}
                onChange={e => setGroupMarks(e.target.value ? Number(e.target.value) : '')}
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
                disabled={!groupTitle.trim() || groupMarks === ''}
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
