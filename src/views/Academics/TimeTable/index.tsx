'use client'
import { Typography, Box, Grow, useTheme, useMediaQuery, Select, MenuItem, FormControl, Button } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { useLoader } from 'src/@core/context/loaderContext'
import CardButton from 'src/components/Cards/CardButton'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramSegmentDetailsQuery } from 'src/store/services/viewServices'
import GetChaarvyIcons from 'src/utils/icons'

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

  const { data: programsData, isLoading, isError: isErrorFetchingPrograms } = useGetProgramsListQuery(true)

  const [fetchProgramSegments, { data: segmentsData }] = useLazyGetProgramSegmentDetailsQuery()
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
      id: segment.program_segment_id,
      name: segment.segment_name
    }))
  }, [segmentsData])

  const handleClick = (item: any) => {
    if (view === ViewState.PROGRAM) {
      setSelectedProgram(item.id)
      setSelectedSegment(null)
      fetchProgramSegments(item.id)
        .unwrap()
        .then(() => {
          setView(ViewState.SEGMENT)
        })

      return
    }

    setSelectedSegment(item.id)
  }

  const handleBack = () => {
    setSelectedProgram(null)
    setSelectedSegment(null)
    setView(backMap[view])
  }

  const renderPrograms = () => (
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
  )

  const renderSegments = () => {
    // 📱 Mobile dropdown
    if (isMobile) {
      return (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', pb: 1 }}>
          <FormControl fullWidth size='small'>
            <Select
              value={selectedSegment || ''}
              displayEmpty
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

    // 💻 Desktop cards
    return (
      <ChaarvyFlex
        className={{
          gap: 2,
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {segmentList.map(item => (
          <CardButton
            key={item.id}
            onClick={() => handleClick(item)}
            size='micro'
            className={{
              backgroundImage: `linear-gradient(to bottom, ${selectedSegment === item.id ? '#2e0156, #d19cff' : '#fff'})`
            }}
          >
            <Typography textAlign='center' sx={{ color: selectedSegment === item.id ? '#fff' : 'text.primary' }}>
              {item.name}
            </Typography>
          </CardButton>
        ))}
      </ChaarvyFlex>
    )
  }

  return (
    <>
      {/* 🔙 Back Button */}
      {view !== ViewState.PROGRAM && (
        <Button variant='text' size='small' startIcon={<GetChaarvyIcons iconName='ArrowLeft' />} onClick={handleBack}>
          Back
        </Button>
      )}

      <ChaarvyFlex
        className={{
          direction: isMobile ? 'column' : 'row',
          justifyContent: 'flex-start',
          alignItems: 'start',
          width: '100%',
          gap: 2,
          mt: 3
        }}
      >
        {/* 📚 Left Panel */}

        {view === ViewState.PROGRAM ? (
          <Box>{renderPrograms()}</Box>
        ) : (
          <Box sx={{ width: isMobile ? '100%' : '20%' }}>{renderSegments()}</Box>
        )}

        {/* 📊 Right Panel */}
        <ChaarvyFlex className={{ width: isMobile ? '100%' : '75%' }}>
          {view === ViewState.SEGMENT &&
            (selectedSegment ? (
              <TimeTableSchedulerBoard programId={selectedProgram} segmentId={selectedSegment} />
            ) : (
              <ChaarvyFlex
                className={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 10
                }}
              >
                <Grow in timeout={600}>
                  <Typography variant='h6'>Select a segment to continue</Typography>
                </Grow>
              </ChaarvyFlex>
            ))}
        </ChaarvyFlex>
      </ChaarvyFlex>
    </>
  )
}

export default TimeTableView
