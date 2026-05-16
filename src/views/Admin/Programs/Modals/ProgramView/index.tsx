import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import React, { ReactNode, SyntheticEvent, useState } from 'react'

import { Typography } from '@muiElements'
import { Language, Program } from 'src/lib/types'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useGetLanguagesListQuery } from 'src/store/services/listServices'
import { ProgramSegment, useGetProgramSegmentDetailsQuery } from 'src/store/services/viewServices'

import ProgramSegmentView from './programSegments'
import SegmentMediums from './segmentMediums'
import SegmentSections from './segmentSections'

export interface ProgramView {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

enum Tabs {
  SEGMENTS = 'segments',
  MEDIUMS = 'mediums',
  SECTIONS = 'sections',
  LANGUAGES = 'languages'
}

interface ProgramViewTabs {
  value: Tabs
  component: ReactNode
  label: string
}

export interface ProgramViewTabProps {
  program_id?: string
  segments?: ProgramSegment[]
  languages?: Language[]
  isLoading: boolean
}

const ProgramViewModal = ({ selectedProgram, isOpen, onClose }: ProgramView) => {
  const { data: programSegments, isFetching: isFetchingSegments } = useGetProgramSegmentDetailsQuery(
    selectedProgram?.program_id ?? '',
    {
      skip: !selectedProgram?.program_id
    }
  )

  const { data: languagesList, isFetching: isFetchingLanguages } = useGetLanguagesListQuery()

  const [value, setValue] = useState<Tabs>(Tabs.SEGMENTS)

  const isLoading = isFetchingLanguages || isFetchingSegments

  const tabs: ProgramViewTabs[] = [
    {
      value: Tabs.SEGMENTS,
      component: (
        <ProgramSegmentView program_id={selectedProgram?.program_id} segments={programSegments} isLoading={isLoading} />
      ),
      label: 'Segments'
    },
    {
      value: Tabs.MEDIUMS,
      component: (
        <SegmentMediums
          program_id={selectedProgram?.program_id}
          segments={programSegments}
          isLoading={isLoading}
          languages={languagesList}
        />
      ),
      label: 'Mediums'
    },
    {
      value: Tabs.SECTIONS,
      component: (
        <SegmentSections program_id={selectedProgram?.program_id} segments={programSegments} isLoading={isLoading} />
      ),
      label: 'Sections (capacity)'
    }

    // { value: Tabs.LANGUAGES, component: <Typography>Languages</Typography>, label: 'Languages' }
  ]

  const handleChange = (_: SyntheticEvent, newTab: Tabs) => {
    setValue(newTab)
  }

  return (
    <ChaarvyModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedProgram?.program_name}
      modalSize='col-12 col-md-10 col-xl-8'
    >
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          aria-label='program-view-tab'
          sx={{ borderBottom: t => `1px solid ${t.palette.divider}` }}
        >
          {tabs.map(({ value, label }) => (
            <Tab
              sx={{ textTransform: 'none' }}
              key={value}
              value={value}
              label={<Typography variant='body1'>{label}</Typography>}
            />
          ))}
        </TabList>
        {tabs.map(({ value, component }) => (
          <TabPanel key={value} sx={{ p: 0 }} value={value}>
            {component}
          </TabPanel>
        ))}
      </TabContext>
    </ChaarvyModal>
  )
}

export default ProgramViewModal
