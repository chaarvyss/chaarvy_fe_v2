import { IconButton, Tooltip } from '@mui/material'
import { useMemo, useState } from 'react'

import { Box, Card, Typography, Grid, Chip, TextField } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ChaarvyButton, ChaarvyModal, LoadingSpinner } from 'src/reusable_components'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'
import { useGetActiveSegmentMediumsQuery } from 'src/store/services/admisissionsService'
import { useCreateUpdateTopicMutation, useGetTopicsListQuery } from 'src/store/services/facultyServices'
import {
  useGetAllProgramSegmentsListQuery,
  useGetProgramSegmentSubjectsListQuery
} from 'src/store/services/programServices'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import TopicQuestionBank from './TopicQuestionBank'

type TopicRequestPayload = {
  program: string
  segment: string
  subject: string
}

const TopicManagement = () => {
  const { triggerToast } = useToast()

  const [topicRequestPayload, setTopicRequestPayload] = useState<TopicRequestPayload>({
    program: '',
    segment: '',
    subject: ''
  })

  const [topicDetails, setTopicDetails] = useState<{
    topic_name: string
    description: string
    topic_id?: string
  }>({
    topic_name: '',
    description: ''
  })

  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)

  const { data: programSegments } = useGetAllProgramSegmentsListQuery()

  const { data: mediumResponse } = useGetActiveSegmentMediumsQuery(
    {
      program_id: topicRequestPayload?.program,
      segment_id: topicRequestPayload?.segment
    },
    { skip: !topicRequestPayload?.program || !topicRequestPayload?.segment }
  )

  const [createUpdateTopic] = useCreateUpdateTopicMutation()

  const { data: topicsResponse, isFetching: isFetchingTopics } = useGetTopicsListQuery(
    {
      program_id: topicRequestPayload.program,
      segment_id: topicRequestPayload.segment,
      subject_id: topicRequestPayload.subject
    },
    {
      skip: Object.values(topicRequestPayload).includes('')
    }
  )

  const programs = (programSegments ?? []).filter(item => item?.status !== 0)

  const programOptions = Array.from(
    new Map(
      programs.map((item: any) => [item.program_id, { label: item.program_name, value: item.program_id }])
    ).values()
  )

  const segmentOptions = Array.from(
    new Map(
      programs
        .filter((item: any) => item.program_id === topicRequestPayload?.program)
        .map((item: any) => [item.segment_id, { label: item.segment_name, value: item.segment_id }])
    ).values()
  )

  const { data: subjectsResponse } = useGetProgramSegmentSubjectsListQuery(
    {
      program_id: topicRequestPayload?.program,
      segment_id: topicRequestPayload?.segment
    },
    {
      skip: !topicRequestPayload?.program || !topicRequestPayload?.segment
    }
  )

  const subjects = useMemo(
    () =>
      (subjectsResponse ?? []).map((item: any) => ({
        label: item?.subject_name,
        value: item?.subject_id
      })),
    [subjectsResponse]
  )

  if (selectedTopic) {
    return <TopicQuestionBank topic={selectedTopic} onBack={() => setSelectedTopic(null)} mediums={mediumResponse} />
  }

  const handleChange = (e: string, key: string) => {
    setTopicRequestPayload({ ...topicRequestPayload, [key]: e })
  }

  const handleOpenModal = (topic?: any) => {
    if (topic) {
      setEditingTopicId(topic.id)
      setTopicDetails(topic)
    } else {
      setEditingTopicId(null)
      setTopicDetails({
        topic_name: '',
        description: '',
        topic_id: ''
      })
    }
    setAddModalOpen(true)
  }

  const handleSaveTopic = () => {
    const { program, segment, subject } = topicRequestPayload
    createUpdateTopic({
      ...topicDetails,
      program_id: program,
      segment_id: segment,
      subject_id: subject
    })
      .unwrap()
      .then(() => {
        setAddModalOpen(false)
        setTopicDetails({
          topic_name: '',
          description: ''
        })
        triggerToast('Topic created successfully', {
          variant: ToastVariants.SUCCESS
        })
      })
      .catch((error: any) => {
        triggerToast(error.message || 'Failed to create topic', {
          variant: ToastVariants.ERROR
        })
      })
  }

  const handleTopicChange = (value: string, key: string) => {
    setTopicDetails((prev: any) => ({
      ...prev,
      [key]: value
    }))
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
                label='Program'
                placeholder='Select Program'
                options={programOptions}
                value={topicRequestPayload?.program}
                onChange={(e: any) => handleChange(e.target.value, 'program')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ChaarvySelect
                label='Class'
                placeholder='Select Class'
                options={segmentOptions}
                value={topicRequestPayload?.segment}
                onChange={(e: any) => handleChange(e.target.value, 'segment')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ChaarvySelect
                label='Subject'
                placeholder='Select Subject'
                options={subjects}
                value={topicRequestPayload?.subject}
                onChange={(e: any) => handleChange(e.target.value, 'subject')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ChaarvyButton
                variant='contained'
                color='primary'
                disabled={
                  !topicRequestPayload?.program || !topicRequestPayload?.segment || !topicRequestPayload?.subject
                }
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

      {isFetchingTopics ? (
        <LoadingSpinner />
      ) : (
        <Card sx={{ p: 2, animation: 'fadeIn 0.5s ease-in', flexGrow: 1, overflowY: 'auto' }}>
          <Typography variant='h6' mb={3} color='text.primary'>
            Configured Topics
          </Typography>
          <Grid container spacing={3}>
            {(topicsResponse ?? []).length > 0 ? (
              topicsResponse?.map(topic => (
                <Grid item xs={12} md={6} lg={4} key={topic.topic_id}>
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
                      <Tooltip placement='top' title={topic.topic_name}>
                        <Typography noWrap maxWidth={200} variant='h6' color='text.primary' sx={{ lineHeight: 1.3 }}>
                          {topic.topic_name}
                        </Typography>
                      </Tooltip>
                      <Chip
                        label={`${topic.total_questions} Qs`}
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
                      {topic.description}
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
      )}
    </Box>
  )
}

export default TopicManagement
