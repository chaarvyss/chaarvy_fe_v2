'use client'
import {
  Typography,
  Box,
  Grow,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  Button,
  Stack,
  ListItemText,
  List,
  ListItemButton
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { useLoader } from 'src/@core/context/loaderContext'
import CardButton from 'src/components/Cards/CardButton'
import { ChaarvyModal, LoadingSpinner } from 'src/reusable_components'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramSegmentDetailsQuery } from 'src/store/services/viewServices'
import GetChaarvyIcons from 'src/utils/icons'

import TimeTableTemplater from './timeTableTemplate'
import TimeTableSchedulerBoard from './timeTableUpdater'

enum ViewState {
  PROGRAM = 'program',
  SEGMENT = 'segment'
}

const TimeTableView = () => {
  const { setLoading } = useLoader()

  const [view, setView] = useState<ViewState>(ViewState.PROGRAM)
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  const [isTemplateDesignerOpen, setIsTemplateDesignerOpen] = useState(false)

  const { data: programsData, isLoading, isError: isErrorFetchingPrograms } = useGetProgramsListQuery(true)

  const [fetchProgramSegments, { data: segmentsData, isFetching: isFetchingSegments }] =
    useLazyGetProgramSegmentDetailsQuery()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading])

  const backMap = {
    [ViewState.SEGMENT]: ViewState.PROGRAM
  }

  const programList = useMemo(() => {
    return (programsData ?? []).map(program => ({
      id: program.program_id,
      name: program.program_name
    }))
  }, [programsData])

  const segmentList = useMemo(() => {
    return (segmentsData ?? []).map(segment => ({
      id: segment.segment_id,
      name: segment.segment_name
    }))
  }, [segmentsData])

  const handleClick = (item: any) => {
    if (view === ViewState.PROGRAM) {
      setSelectedProgram(item.id)
      setSelectedSegment(null)
      fetchProgramSegments({ program_id: item.id })
        .unwrap()
        .then(() => {
          setView(ViewState.SEGMENT)
        })

      return
    } else {
      setSelectedSegment(item.id)
    }
  }

  const handleBack = () => {
    setSelectedProgram(null)
    setSelectedSegment(null)
    setView(backMap[view])
  }

  const getSegmentName = (segmentId: string) => {
    if (!segmentId) return ''
    const segment = segmentList.find(item => item.id === segmentId)

    return segment ? segment.name : ''
  }

  const renderPrograms = () => (
    <Stack direction='column' spacing={2} flexWrap='wrap' justifyContent='center' alignItems='center' width='100%'>
      <Stack direction='row' justifyContent='end' alignItems='center' width='100%'>
        <Button sx={{ textTransform: 'none' }} onClick={() => setIsTemplateDesignerOpen(true)}>
          Template designer
        </Button>
      </Stack>
      <TimeTableTemplater isOpen={isTemplateDesignerOpen} onClose={() => setIsTemplateDesignerOpen(false)} />
      <ChaarvyFlex
        className={{
          gap: 3,
          justifyContent: 'center',
          width: '100%',
          flexWrap: 'wrap'
        }}
      >
        {isErrorFetchingPrograms ? (
          <Typography color='error'>Error fetching programs</Typography>
        ) : (
          programList.map(item => (
            <CardButton key={item.id} onClick={() => handleClick(item)} size='micro'>
              <Typography textAlign='center'>{item.name}</Typography>
            </CardButton>
          ))
        )}
      </ChaarvyFlex>
      {isFetchingSegments && <LoadingSpinner loadingText='Fetching segments...' />}
    </Stack>
  )

  const renderSegments = () => {
    // 📱 Mobile dropdown
    if (isMobile) {
      return (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)', // Slight transparency
            backdropFilter: 'blur(8px)', // Modern glass effect
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <FormControl fullWidth size='small' sx={{ mt: 1 }}>
            <Select
              value={selectedSegment || ''}
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
              onChange={e => {
                const selected = segmentList.find(item => item.id === e.target.value)
                if (selected) handleClick(selected)
              }}
            >
              <MenuItem value='' disabled>
                Select Segment
              </MenuItem>
              {segmentList.map(item => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )
    }

    // 💻 Desktop Sidebar (Modernized)
    return (
      <Box
        sx={{
          borderRight: '1px solid',
          borderColor: 'divider',
          pr: 2,
          height: '100%',
          minHeight: '60vh'
        }}
      >
        <Typography
          variant='overline'
          sx={{ color: 'text.secondary', ml: 1, mb: 1, display: 'block', textTransform: 'none' }}
        >
          Available Segments
        </Typography>
        <List sx={{ p: 0 }}>
          {segmentList.map(item => {
            const isSelected = item.id === selectedSegment

            return (
              <ListItemButton
                key={item.id}
                onClick={() => handleClick(item)}
                selected={isSelected}
                sx={{
                  mb: 0.5,
                  borderRadius: 2, // Soft rounded corners
                  transition: 'all 0.2s',
                  ...(isSelected && {
                    bgcolor: 'primary.50', // Soft primary background
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.100'
                    }
                  }),
                  ...(!isSelected && {
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: 'text.primary'
                    }
                  })
                }}
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* 🔙 Back Button */}
      {view !== ViewState.PROGRAM && (
        <Button
          variant='text'
          size='small'
          startIcon={<GetChaarvyIcons iconName='ArrowLeft' />}
          onClick={handleBack}
          sx={{
            mb: 2, // Added margin bottom to separate it from the layout
            borderRadius: 6,
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          Back to Programs
        </Button>
      )}

      {/* 🏗️ Main Side-by-Side Layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'flex-start', // Keeps items aligned to the top
          gap: 3,
          width: '100%'
        }}
      >
        {/* 📚 Left Panel (Sidebar) */}
        {view === ViewState.PROGRAM ? (
          <Box sx={{ width: '100%' }}>{renderPrograms()}</Box>
        ) : (
          <Box
            sx={{
              width: isMobile ? '100%' : '250px',
              flexShrink: 0 // Prevents the sidebar from getting squished
            }}
          >
            {renderSegments()}
          </Box>
        )}

        {/* 📊 Right Panel (Timetable Area) */}
        <Box
          sx={{
            flex: 1, // Tells this box to take up all remaining space
            width: '100%',
            minWidth: 0 // Crucial trick to prevent flex children from overflowing horizontally
          }}
        >
          {view === ViewState.SEGMENT &&
            (selectedSegment ? (
              <ChaarvyModal
                isOpen={!!selectedSegment}
                modalSize='col-12 col-md-10 col-xxl-9'
                onClose={() => setSelectedSegment(null)}
                title={`${getSegmentName(selectedSegment)} - Timetable Scheduler`}
                shouldRestrictCloseOnOuterClick={true}
              >
                <TimeTableSchedulerBoard programId={selectedProgram} segmentId={selectedSegment} />
              </ChaarvyModal>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '400px',
                  bgcolor: 'background.default',
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: 'divider',
                  p: 4
                }}
              >
                <Grow in timeout={600}>
                  <Box textAlign='center'>
                    <Typography variant='h6' color='text.primary' gutterBottom>
                      No Segment Selected
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Please choose a segment from the menu to view and manage its timetable.
                    </Typography>
                  </Box>
                </Grow>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  )
}

export default TimeTableView
