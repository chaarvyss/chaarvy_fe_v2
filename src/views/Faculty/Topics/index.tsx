import { useMemo, useState } from 'react'

import { Box, Card, Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useGetActiveSegmentMediumsQuery } from 'src/store/services/admisissionsService'
import { useCreateUpdateTopicMutation, useGetTopicsListQuery } from 'src/store/services/facultyServices'
import {
  useGetAllProgramSegmentsListQuery,
  useGetProgramSegmentSubjectsListQuery
} from 'src/store/services/programServices'

import TopicFilter from './components/TopicFilter'
import TopicList from './components/TopicList'
import TopicModal from './components/TopicModal'
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

  const programs = (programSegments ?? []).filter((item: any) => item?.status !== 0)

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
    return (
      <TopicQuestionBank
        topic={{ ...selectedTopic, ...topicRequestPayload }}
        onBack={() => setSelectedTopic(null)}
        mediums={mediumResponse}
      />
    )
  }

  const handleChange = (value: string, key: string) => {
    setTopicRequestPayload({ ...topicRequestPayload, [key]: value })
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

        <TopicFilter
          topicRequestPayload={topicRequestPayload}
          handleChange={handleChange}
          programOptions={programOptions}
          segmentOptions={segmentOptions}
          subjects={subjects}
          handleOpenModal={handleOpenModal}
        />
      </Box>

      <TopicList
        isFetchingTopics={isFetchingTopics}
        topicsResponse={topicsResponse ?? []}
        setSelectedTopic={setSelectedTopic}
        handleOpenModal={handleOpenModal}
      />

      <TopicModal
        isAddModalOpen={isAddModalOpen}
        setAddModalOpen={setAddModalOpen}
        editingTopicId={editingTopicId}
        topicDetails={topicDetails}
        handleTopicChange={handleTopicChange}
        handleSaveTopic={handleSaveTopic}
      />
    </Box>
  )
}

export default TopicManagement
