import { IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'

import { Box, Card, Typography, Grid, Chip, TextField } from '@muiElements'
import { ChaarvyButton, ChaarvyModal } from 'src/reusable_components'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import TopicQuestionBank from './TopicQuestionBank'

// Mock Data
const CLASSES = [
  { label: 'Class 1', value: 'c1' },
  { label: 'Class 2', value: 'c2' },
  { label: 'Class 3', value: 'c3' },
  { label: 'Class 4', value: 'c4' },
  { label: 'Class 5', value: 'c5' }
]

const SUBJECTS = [
  { label: 'Mathematics', value: 'math' },
  { label: 'Science', value: 'sci' },
  { label: 'English', value: 'eng' }
]

const MOCK_TOPICS: Record<string, { id: string; title: string; desc: string; qsCount: number }[]> = {
  'c3-math': [
    { id: 't1', title: 'Addition and Subtraction', desc: 'Basic arithmetic operations.', qsCount: 15 },
    { id: 't2', title: 'Multiplication Tables', desc: 'Learn tables 1 through 10.', qsCount: 8 }
  ],
  'c5-sci': [
    { id: 't3', title: 'Solar System', desc: 'Planets, sun, and basic astronomy.', qsCount: 20 },
    { id: 't4', title: 'Human Body', desc: 'Organs and systems.', qsCount: 12 }
  ]
}

const TopicManagement = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  // Add Topic Modal State
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [, setForceUpdate] = useState(0)

  const currentKey = `${selectedClass}-${selectedSubject}`
  const topics = MOCK_TOPICS[currentKey] || []

  if (selectedTopic) {
    return <TopicQuestionBank topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
  }

  const handleOpenModal = (topic?: any) => {
    if (topic) {
      setEditingTopicId(topic.id)
      setNewTitle(topic.title)
      setNewDesc(topic.desc)
    } else {
      setEditingTopicId(null)
      setNewTitle('')
      setNewDesc('')
    }
    setAddModalOpen(true)
  }

  const handleSaveTopic = () => {
    if (!newTitle.trim()) return
    if (!MOCK_TOPICS[currentKey]) {
      MOCK_TOPICS[currentKey] = []
    }

    if (editingTopicId) {
      const topicIndex = MOCK_TOPICS[currentKey].findIndex(t => t.id === editingTopicId)
      if (topicIndex > -1) {
        MOCK_TOPICS[currentKey][topicIndex] = {
          ...MOCK_TOPICS[currentKey][topicIndex],
          title: newTitle,
          desc: newDesc
        }
      }
    } else {
      MOCK_TOPICS[currentKey].push({
        id: `t_${Date.now()}`,
        title: newTitle,
        desc: newDesc || 'No description provided.',
        qsCount: 0
      })
    }
    setForceUpdate(prev => prev + 1)
    setAddModalOpen(false)
    setNewTitle('')
    setNewDesc('')
    setEditingTopicId(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box>
        <Card sx={{ p: 2 }}>
          <Typography variant='h6'>Topic Management</Typography>
          <Typography variant='caption'>
            Organize your curriculum, manage topics, and build robust question banks for your classes.
          </Typography>
        </Card>

        <Card sx={{ p: 2, my: 2 }}>
          <Grid container spacing={4} alignItems='flex-end'>
            <Grid item xs={12} sm={4}>
              <ChaarvySelect
                label='Class / Program'
                placeholder='Select Class'
                options={CLASSES}
                value={selectedClass || ''}
                onChange={(e: any) => setSelectedClass(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ChaarvySelect
                label='Subject'
                placeholder='Select Subject'
                options={SUBJECTS}
                value={selectedSubject || ''}
                onChange={(e: any) => setSelectedSubject(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ChaarvyButton
                variant='contained'
                color='primary'
                disabled={!selectedClass || !selectedSubject}
                fullWidth
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                onClick={() => handleOpenModal()}
              >
                + Add New Topic
              </ChaarvyButton>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {selectedClass && selectedSubject && (
        <Card sx={{ p: 2, animation: 'fadeIn 0.5s ease-in', flexGrow: 1, overflowY: 'auto' }}>
          <Typography variant='h6' mb={3} color='text.primary'>
            Configured Topics
          </Typography>
          <Grid container spacing={3}>
            {topics.length > 0 ? (
              topics.map(topic => (
                <Grid item xs={12} md={6} lg={4} key={topic.id}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                        borderColor: 'primary.main',
                        '& .topic-overlay': {
                          opacity: 1
                        }
                      }
                    }}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <Box
                      className='topic-overlay'
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                    <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={2}>
                      <Tooltip placement='top' title={topic.title}>
                        <Typography noWrap maxWidth={200} variant='h6' color='text.primary' sx={{ lineHeight: 1.3 }}>
                          {topic.title}
                        </Typography>
                      </Tooltip>
                      <Chip
                        label={`${topic.qsCount} Qs`}
                        size='small'
                        sx={{
                          bgcolor: 'rgba(118, 75, 162, 0.1)',
                          color: '#764ba2',
                          fontWeight: 600,
                          borderRadius: 1.5
                        }}
                      />
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {topic.desc}
                    </Typography>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Typography
                        variant='subtitle2'
                        color='primary.main'
                        sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        Manage Question Bank →
                      </Typography>
                      <IconButton
                        size='small'
                        aria-label='edit'
                        onClick={(e: any) => {
                          e.stopPropagation()
                          handleOpenModal(topic)
                        }}
                      >
                        <GetChaarvyIcons color='warning' fontSize='1.25rem' iconName={ChaarvyIcon.PencilOutline} />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Card
                  sx={{
                    p: 5,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '1px dashed rgba(0,0,0,0.2)',
                    bgcolor: 'rgba(0,0,0,0.02)',
                    boxShadow: 'none'
                  }}
                >
                  <Typography variant='h6' color='text.secondary' mb={1}>
                    No topics configured yet
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Click "Add New Topic" to create your first topic for this subject.
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
        </Card>
      )}

      {/* Add New Topic Modal */}
      {isAddModalOpen && (
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
              <TextField value={newTitle} size='small' onChange={e => setNewTitle(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='caption'>Description (Optional)</Typography>
              <TextField
                multiline
                rows={3}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
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
                disabled={!newTitle.trim()}
              >
                {editingTopicId ? 'Update Topic' : 'Save Topic'}
              </ChaarvyButton>
            </Grid>
          </Grid>
        </ChaarvyModal>
      )}
    </Box>
  )
}

export default TopicManagement
