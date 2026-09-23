import { Box, Collapse, TextField, MenuItem, IconButton, Tooltip } from '@mui/material'
import CloseIcon from 'mdi-material-ui/Close'
import FilterOutlineIcon from 'mdi-material-ui/FilterOutline'
import FilterVariantIcon from 'mdi-material-ui/FilterVariant'
import React, { useMemo } from 'react'

import {
  useGetProgramsListQuery,
  useGetSegmentsListQuery,
  useGetSectionsListQuery,
  useGetLanguagesListQuery
} from 'src/store/services/listServices'
import { useGetProgramSegmentMediumsListByProgramIdQuery } from 'src/store/services/programServices'

import { useChatContext } from '../context/ChatContext'

interface ChatAdvancedFiltersProps {
  showFilters: boolean
  setShowFilters: (val: boolean) => void
}

const ChatAdvancedFilters: React.FC<ChatAdvancedFiltersProps> = ({ showFilters, setShowFilters }) => {
  const {
    contactFilterProgram,
    setContactFilterProgram,
    contactFilterSegment,
    setContactFilterSegment,
    contactFilterMedium,
    setContactFilterMedium,
    contactFilterSection,
    setContactFilterSection,
    contactFilterAdmission,
    setContactFilterAdmission
  } = useChatContext()

  const { data: allPrograms } = useGetProgramsListQuery(false)
  const { data: allSegments } = useGetSegmentsListQuery()
  const { data: allMediums } = useGetLanguagesListQuery()
  const { data: allSections } = useGetSectionsListQuery()

  const { data: programSegmentMediums } = useGetProgramSegmentMediumsListByProgramIdQuery(
    { program_id: contactFilterProgram, only_active: true },
    { skip: !contactFilterProgram }
  )

  const availableSegments = useMemo(() => {
    if (!contactFilterProgram) return allSegments
    if (!programSegmentMediums) return []
    const uniqueMap = new Map()
    programSegmentMediums.forEach(item => {
      uniqueMap.set(item.segment_id, { segment_id: item.segment_id, segment_name: item.segment_name })
    })
    return Array.from(uniqueMap.values())
  }, [contactFilterProgram, allSegments, programSegmentMediums])

  const availableMediums = useMemo(() => {
    if (!contactFilterProgram && !contactFilterSegment) return allMediums
    if (contactFilterProgram && programSegmentMediums) {
      let filtered = programSegmentMediums
      if (contactFilterSegment) {
        filtered = filtered.filter(item => item.segment_id === contactFilterSegment)
      }
      const uniqueMap = new Map()
      filtered.forEach(item => {
        uniqueMap.set(item.medium_id, { language_id: item.medium_id, language_name: item.medium_name })
      })
      return Array.from(uniqueMap.values())
    }
    return allMediums
  }, [contactFilterProgram, contactFilterSegment, allMediums, programSegmentMediums])

  const hasActiveFilters = !!(
    contactFilterProgram ||
    contactFilterSegment ||
    contactFilterMedium ||
    contactFilterSection ||
    contactFilterAdmission
  )

  const handleClear = () => {
    setContactFilterProgram('')
    setContactFilterSegment('')
    setContactFilterMedium('')
    setContactFilterSection('')
    setContactFilterAdmission('')
  }

  const handleProgramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactFilterProgram(e.target.value)
    setContactFilterSegment('')
    setContactFilterMedium('')
    setContactFilterSection('')
  }

  const handleSegmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactFilterSegment(e.target.value)
    setContactFilterMedium('')
    setContactFilterSection('')
  }

  const handleMediumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactFilterMedium(e.target.value)
    setContactFilterSection('')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: -1 }}>
        {hasActiveFilters && (
          <Tooltip title='Clear Filters'>
            <IconButton size='small' onClick={handleClear} sx={{ mr: 1 }}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title='Toggle Advanced Filters'>
          <IconButton
            size='small'
            onClick={() => setShowFilters(!showFilters)}
            color={hasActiveFilters ? 'primary' : 'default'}
          >
            {hasActiveFilters ? <FilterVariantIcon /> : <FilterOutlineIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={showFilters}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mb: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.default'
          }}
        >
          <TextField
            select
            size='small'
            label='Program'
            value={contactFilterProgram}
            onChange={handleProgramChange}
          >
            <MenuItem value=''>
              <em>Any</em>
            </MenuItem>
            {allPrograms?.map((p: any) => (
              <MenuItem key={p.program_id} value={p.program_id}>
                {p.program_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size='small'
            label='Segment'
            value={contactFilterSegment}
            onChange={handleSegmentChange}
          >
            <MenuItem value=''>
              <em>Any</em>
            </MenuItem>
            {availableSegments?.map((s: any) => (
              <MenuItem key={s.segment_id} value={s.segment_id}>
                {s.segment_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size='small'
            label='Medium'
            value={contactFilterMedium}
            onChange={handleMediumChange}
          >
            <MenuItem value=''>
              <em>Any</em>
            </MenuItem>
            {availableMediums?.map((m: any) => (
              <MenuItem key={m.language_id || m.id} value={m.language_id || m.id}>
                {m.language_name || m.name || m.language || 'Medium'}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size='small'
            label='Section'
            value={contactFilterSection}
            onChange={e => setContactFilterSection(e.target.value)}
          >
            <MenuItem value=''>
              <em>Any</em>
            </MenuItem>
            {allSections?.map((s: any) => (
              <MenuItem key={s.section_id} value={s.section_id}>
                {s.section_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size='small'
            label='Admission Number'
            value={contactFilterAdmission}
            onChange={e => setContactFilterAdmission(e.target.value)}
            sx={{ gridColumn: 'span 2' }}
          />
        </Box>
      </Collapse>
    </Box>
  )
}

export default ChatAdvancedFilters
