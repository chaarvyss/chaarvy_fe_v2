import { Checkbox } from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useState } from 'react'

import { Box, Card, Divider, Grid, Typography } from '@muiElements'
import { ChaarvyButton } from 'src/reusable_components'

type Topic = { id: string; title: string; deadline: Date | null; completed: boolean }

interface Props {
  classId: string | null
  subjectId: string | null
  topics: Topic[]
  onBack: () => void
}

const QuestionPaperGenerator = ({ classId, subjectId, topics, onBack }: Props) => {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [isPreview, setIsPreview] = useState(false)

  const handleToggle = (id: string) => {
    setSelectedTopicIds(prev => (prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]))
  }

  const handlePrint = () => {
    window.print()
  }

  if (isPreview) {
    return (
      <Box sx={{ p: 4, bgcolor: '#fff', minHeight: '100vh' }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4} className='no-print'>
          <ChaarvyButton variant='outlined' onClick={() => setIsPreview(false)}>
            Back to Configuration
          </ChaarvyButton>
          <ChaarvyButton variant='contained' onClick={handlePrint}>
            Print Question Paper
          </ChaarvyButton>
        </Box>

        {/* Printable Area */}
        <Box sx={{ border: '2px solid #000', p: 4 }}>
          <Typography variant='h4' textAlign='center' fontWeight={700} mb={1}>
            Chaarvy Public School
          </Typography>
          <Typography variant='h6' textAlign='center' mb={2}>
            Term Examination - {new Date().getFullYear()}
          </Typography>

          <Grid container justifyContent='space-between' mb={2}>
            <Typography variant='subtitle1' fontWeight={600}>
              Class: {classId?.toUpperCase()}
            </Typography>
            <Typography variant='subtitle1' fontWeight={600}>
              Subject: {subjectId?.toUpperCase()}
            </Typography>
          </Grid>
          <Divider sx={{ borderBottomWidth: 2, borderColor: '#000', mb: 3 }} />

          <Typography variant='h6' fontWeight={600} mb={2}>
            Section A: Multiple Choice Questions (1 Mark Each)
          </Typography>
          {[1, 2, 3].map(i => (
            <Box key={`mcq-${i}`} mb={2}>
              <Typography variant='body1'>
                Q{i}. This is a sample multiple choice question generated from selected topics?
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1, pl: 2 }}>
                <Grid item xs={6}>
                  a) Option 1
                </Grid>
                <Grid item xs={6}>
                  b) Option 2
                </Grid>
                <Grid item xs={6}>
                  c) Option 3
                </Grid>
                <Grid item xs={6}>
                  d) Option 4
                </Grid>
              </Grid>
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />

          <Typography variant='h6' fontWeight={600} mb={2}>
            Section B: Theory Questions (5 Marks Each)
          </Typography>
          {[4, 5].map(i => (
            <Box key={`th-${i}`} mb={3}>
              <Typography variant='body1'>
                Q{i}. Explain in detail a key concept related to the topics selected. Provide examples where necessary.
              </Typography>
              <Box sx={{ mt: 1, height: 100, borderBottom: '1px dashed #ccc' }}></Box>
              <Box sx={{ height: 100, borderBottom: '1px dashed #ccc' }}></Box>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box display='flex' alignItems='center' mb={3} gap={2}>
        <ChaarvyButton variant='outlined' onClick={onBack} size='small'>
          Back to Planner
        </ChaarvyButton>
        <Typography variant='h5' fontWeight={600}>
          Generate Question Paper
        </Typography>
      </Box>

      <Card sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant='h6' mb={2}>
          Select Topics to Include
        </Typography>
        <Typography variant='body2' color='text.secondary' mb={3}>
          The generated paper will randomly select questions from the configured question banks of the selected topics.
        </Typography>

        <Grid container spacing={2}>
          {topics.map(topic => (
            <Grid item xs={12} sm={6} key={topic.id}>
              <Box sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={selectedTopicIds.includes(topic.id)} onChange={() => handleToggle(topic.id)} />
                  }
                  label={
                    <Typography variant='subtitle1' fontWeight={500}>
                      {topic.title}
                    </Typography>
                  }
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box mt={4} display='flex' justifyContent='flex-end'>
          <ChaarvyButton
            variant='contained'
            color='primary'
            disabled={selectedTopicIds.length === 0}
            onClick={() => setIsPreview(true)}
          >
            Generate Preview
          </ChaarvyButton>
        </Box>
      </Card>
    </Box>
  )
}

export default QuestionPaperGenerator
