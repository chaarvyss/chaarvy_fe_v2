import { useMemo, useState } from 'react'

import { Box, Card, Typography, Grid, Divider } from '@muiElements' // Ensure Grid, Button, Divider are exported from your elements index
import { ChaarvyButton } from 'src/reusable_components'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useGetProgramSegmentMediumsListByProgramIdQuery } from 'src/store/services/programServices'

interface StudentSelectionState {
  program: string | null
  segment: string | null
  medium: string | null
  section: string | null
}

const defaultState: StudentSelectionState = {
  program: null,
  segment: null,
  medium: null,
  section: null
}

const StudentAttendence = () => {
  const [studentSelection, setStudentSelection] = useState<StudentSelectionState>(defaultState)

  const { data: programsList } = useGetProgramsListQuery(true)

  const { data: segmentMediumResponse } = useGetProgramSegmentMediumsListByProgramIdQuery(
    { program_id: studentSelection.program || '', only_active: true },
    { skip: !studentSelection.program }
  )

  const segmentOptions = useMemo(
    () =>
      Array.from(
        new Map(
          segmentMediumResponse?.map(item => [item.segment_id, { label: item.segment_name, value: item.segment_id }])
        ).values()
      ),
    [segmentMediumResponse]
  )

  const mediumOptions = useMemo(() => {
    const selectedSegmentId = studentSelection.segment
    if (!selectedSegmentId) return []

    const filteredData = segmentMediumResponse?.filter(item => item.segment_id === selectedSegmentId)

    return Array.from(
      new Map(filteredData?.map(item => [item.medium_id, { label: item.medium_name, value: item.medium_id }])).values()
    )
  }, [studentSelection.segment, segmentMediumResponse])

  const sectionOptions = useMemo(() => {
    const selectedSegmentId = studentSelection.segment
    if (!selectedSegmentId) return []

    const filteredData = segmentMediumResponse?.filter(
      item => item.segment_id === selectedSegmentId && item.medium_id === studentSelection.medium
    )

    return Array.from(
      new Map(
        filteredData?.map(item => [item.section_id, { label: item.section_name, value: item.section_id }])
      ).values()
    )
  }, [studentSelection.segment, studentSelection.medium, segmentMediumResponse])

  const studentSelectConfig = useMemo(
    () => [
      {
        label: 'Program',
        placeholder: 'Select Program',
        value: studentSelection.program,
        name: 'program',

        // Reset downstream selections when Program changes
        onChange: (e: any) =>
          setStudentSelection({ program: e.target.value, segment: null, medium: null, section: null }),
        options:
          programsList?.map(program => ({
            label: program.program_name,
            value: program.program_id
          })) || []
      },
      {
        label: 'Segment',
        placeholder: 'Select Segment',
        value: studentSelection.segment,
        name: 'segment',

        // Reset downstream selections when Segment changes
        onChange: (e: any) =>
          setStudentSelection({ ...studentSelection, segment: e.target.value, medium: null, section: null }),
        options: segmentOptions
      },
      {
        label: 'Medium',
        placeholder: 'Select Medium',
        value: studentSelection.medium,
        name: 'medium',

        // Reset downstream selections when Medium changes
        onChange: (e: any) => setStudentSelection({ ...studentSelection, medium: e.target.value, section: null }),
        options: mediumOptions
      },
      {
        label: 'Section',
        placeholder: 'Select Section',
        value: studentSelection.section,
        name: 'section',
        onChange: (e: any) => setStudentSelection({ ...studentSelection, section: e.target.value }),
        options: sectionOptions
      }
    ],
    [studentSelection, programsList, segmentOptions, mediumOptions, sectionOptions]
  )

  // Validation to enable/disable buttons
  const isSelectionComplete = Boolean(
    studentSelection.program && studentSelection.segment && studentSelection.medium && studentSelection.section
  )

  return (
    <Card sx={{ p: 3, boxShadow: 2, borderRadius: 2 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { sm: 'row' },
          gap: 2,
          mb: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' }
        }}
      >
        <Typography variant='h6' fontWeight={600} color='text.primary'>
          Attendance
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Period: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Filters Section (Responsive Grid) */}
      <Grid container spacing={2}>
        {studentSelectConfig.map(config => (
          <Grid item xs={12} sm={6} md={3} key={config.name}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <ChaarvySelect
                options={config.options}
                placeholder={config.placeholder}
                value={config.value || ''}
                onChange={config.onChange}
                label={config.label}
                sx={{ width: '100%' }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Actions Section */}
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <ChaarvyButton
          variant='outlined'
          color='primary'
          size='small'
          disabled={!isSelectionComplete}
          onClick={() => console.log('Fetching students for:', studentSelection)}
        >
          Fetch Students
        </ChaarvyButton>
        <ChaarvyButton
          variant='contained'
          size='small'
          color='primary'
          disabled={!isSelectionComplete}
          onClick={() => console.log('Confirming attendance for:', studentSelection)}
        >
          Confirm Attendance
        </ChaarvyButton>
      </Box>
    </Card>
  )
}

export default StudentAttendence
