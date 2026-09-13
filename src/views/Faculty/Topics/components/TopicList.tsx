import { IconButton, Tooltip } from '@mui/material'

import { Box, Card, Typography, Grid, Chip } from '@muiElements'
import { LoadingSpinner } from 'src/reusable_components'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

type TopicListProps = {
  isFetchingTopics: boolean
  topicsResponse: any[]
  setSelectedTopic: (topic: any) => void
  handleOpenModal: (topic: any) => void
}

const TopicList = ({ isFetchingTopics, topicsResponse, setSelectedTopic, handleOpenModal }: TopicListProps) => {
  if (isFetchingTopics) {
    return <LoadingSpinner />
  }

  return (
    <Card sx={{ p: 2, animation: 'fadeIn 0.5s ease-in', flexGrow: 1, overflowY: 'auto' }}>
      <Typography variant='h6' mb={3} color='text.primary'>
        Configured Topics
      </Typography>
      <Grid container spacing={3}>
        {(topicsResponse ?? []).length > 0 ? (
          topicsResponse?.map((topic: any) => (
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
  )
}

export default TopicList
