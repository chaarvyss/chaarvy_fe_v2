import { Card, Grid } from '@muiElements'
import { ChaarvyButton } from 'src/reusable_components'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'

type TopicFilterProps = {
  topicRequestPayload: any
  handleChange: (value: string, key: string) => void
  programOptions: any[]
  segmentOptions: any[]
  subjects: any[]
  handleOpenModal: () => void
}

const TopicFilter = ({
  topicRequestPayload,
  handleChange,
  programOptions,
  segmentOptions,
  subjects,
  handleOpenModal
}: TopicFilterProps) => {
  return (
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
            disabled={!topicRequestPayload?.program || !topicRequestPayload?.segment || !topicRequestPayload?.subject}
            fullWidth
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
            onClick={() => handleOpenModal()}
          >
            + Add New Topic
          </ChaarvyButton>
        </Grid>
      </Grid>
    </Card>
  )
}

export default TopicFilter
