'use client'

import { Autocomplete, Box, Checkbox, ListItemText, Stack, TextField } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ChaarvyModal } from 'src/reusable_components'
import {
  SubjectAssignmentMatrix,
  SubjectAssignmentMatrixHandle,
  useAssignmentMatrixHandlers
} from 'src/reusable_components/SubjectAssignmentMatrix'
import { useGetSubjectsListQuery } from 'src/store/services/listServices'
import {
  useGetAllProgramSegmentsListQuery,
  useGetProgramSegmentSubjectsListQuery
} from 'src/store/services/programServices'

export function FacultyAssignmentPage({
  facultyId,
  isOpen,
  onClose
}: {
  facultyId: string
  isOpen: boolean
  onClose: () => void
}) {
  const mediumsList: any[] = []

  const { data: subjectsList, isFetching: isSubjectsLoading } = useGetSubjectsListQuery({
    limit: 500,
    offset: 0,
    status_: '1'
  })
  const { data: programSegmentsData, isFetching: isProgramsLoading } = useGetAllProgramSegmentsListQuery()
  const { data: programSubjectData, isFetching: isMappingsLoading } = useGetProgramSegmentSubjectsListQuery(undefined)

  const [programs, setPrograms] = useState<any[]>([])
  const [selectedMediumIds, setSelectedMediumIds] = useState<string[]>([])
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const matrixRef = useRef<SubjectAssignmentMatrixHandle>(null)

  useEffect(() => {
    if (programSegmentsData) {
      const grouped: Record<string, any> = {}
      programSegmentsData.forEach((seg: any) => {
        if (!grouped[seg.program_id])
          grouped[seg.program_id] = {
            program_id: seg.program_id,
            program_name: seg.program_name,
            medium_id: seg.medium_id,
            segments: []
          }
        grouped[seg.program_id].segments.push({ segment_id: seg.segment_id, segment_name: seg.segment_name })
      })
      setPrograms(Object.values(grouped))
    }
  }, [programSegmentsData])

  const [hasInitialized, setHasInitialized] = useState(false)

  const pastData: any[] = useMemo(
    () => [
      {
        mapping_id: 1,
        subject_id: '9ac0e9a5-b5bc-478f-b524-1e29adc75e0d',
        program_id: '1d9c747a-770f-447f-8cc1-82904dadde68',
        segment_id: 'ca15f750-335f-44ae-8b6e-a5832e34fcca',
        status: 1,
        faculty_id: 'd96ea2c5-cd1e-11ef-af72-842afd127d37'
      },
      {
        mapping_id: 2,
        subject_id: '71d5c6b1-344b-43b6-acc2-6ae667db82ee',
        program_id: '1d9c747a-770f-447f-8cc1-82904dadde68',
        segment_id: 'ca15f750-335f-44ae-8b6e-a5832e34fcca',
        status: 1,
        faculty_id: 'd96ea2c5-cd1e-11ef-af72-842afd127d37'
      },
      {
        mapping_id: 3,
        subject_id: '03543984-951f-487c-9b0b-f4617d0c6ec9',
        program_id: '1d9c747a-770f-447f-8cc1-82904dadde68',
        segment_id: 'ca15f750-335f-44ae-8b6e-a5832e34fcca',
        status: 1,
        faculty_id: 'd96ea2c5-cd1e-11ef-af72-842afd127d37'
      },
      {
        mapping_id: 4,
        subject_id: '9eeb892f-636a-4bfc-9f1e-2215d4099bb1',
        program_id: '1d9c747a-770f-447f-8cc1-82904dadde68',
        segment_id: 'ca15f750-335f-44ae-8b6e-a5832e34fcca',
        status: 1,
        faculty_id: 'd96ea2c5-cd1e-11ef-af72-842afd127d37'
      },
      {
        mapping_id: 5,
        subject_id: '1ec90c73-6518-462f-9590-c5dec4ecd040',
        program_id: '1d9c747a-770f-447f-8cc1-82904dadde68',
        segment_id: 'ca15f750-335f-44ae-8b6e-a5832e34fcca',
        status: 1,
        faculty_id: 'd96ea2c5-cd1e-11ef-af72-842afd127d37'
      }
    ],
    []
  )

  useEffect(() => {
    if (!isOpen || hasInitialized) return

    const active = pastData.filter(d => d.status === 1)
    setSelectedSubjectIds(Array.from(new Set(active.map(d => d.subject_id))))
    setSelectedProgramIds(Array.from(new Set(active.map(d => d.program_id))))

    setHasInitialized(true)
  }, [pastData, isOpen, hasInitialized])

  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false)
      setSelectedProgramIds([])
      setSelectedSubjectIds([])
    }
  }, [isOpen])

  const availableMediums = useMemo(
    () => (mediumsList ?? []).map((m: any) => ({ medium_id: m.medium_id, medium_name: m.medium_name })),
    [mediumsList]
  )
  const availableSubjects = useMemo(
    () =>
      (subjectsList ?? [])
        .filter((s: any) => s.status === 1)
        .map((s: any) => ({ subject_id: s.subject_id, subject_name: s.subject_name })),
    [subjectsList]
  )

  const filteredPrograms = useMemo(
    () =>
      selectedMediumIds.length === 0
        ? programs
        : programs.filter(p => p.medium_id && selectedMediumIds.includes(p.medium_id)),
    [programs, selectedMediumIds]
  )

  const activePrograms = useMemo(
    () => programs.filter(p => selectedProgramIds.includes(p.program_id)),
    [programs, selectedProgramIds]
  )

  const validSubjectIdsForPrograms = useMemo(() => {
    const validIds = new Set<string>()
    ;(programSubjectData || []).forEach((m: any) => {
      if (m.status === 1 && selectedProgramIds.includes(m.program_id)) validIds.add(m.subject_id)
    })

    return validIds
  }, [programSubjectData, selectedProgramIds])

  const filteredAvailableSubjects = useMemo(() => {
    if (selectedProgramIds.length === 0) return []

    return availableSubjects.filter(s => validSubjectIdsForPrograms.has(s.subject_id))
  }, [availableSubjects, validSubjectIdsForPrograms, selectedProgramIds.length])

  const { handleProgramChange, handleSubjectChange } = useAssignmentMatrixHandlers(
    selectedProgramIds,
    selectedSubjectIds,
    setSelectedProgramIds,
    setSelectedSubjectIds,
    pastData,
    matrixRef
  )

  const handleSave = async (payload: any[]) => {
    const finalPayload = payload.map(item => ({ ...item, faculty_id: facultyId }))
    console.log('Saving Faculty Payload:', finalPayload)
  }

  const isGlobalLoading = isSubjectsLoading || isProgramsLoading || isMappingsLoading

  return (
    <ChaarvyModal isOpen={isOpen} modalSize='col-12 col-md-11' onClose={onClose} title='Faculty Subject Assignment'>
      <Box sx={{ width: '100%', px: 4 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} mb={3}>
          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            limitTags={2}
            sx={{ flex: 1 }}
            options={availableMediums}
            getOptionLabel={o => o.medium_name}
            value={availableMediums.filter(m => selectedMediumIds.includes(m.medium_id))}
            isOptionEqualToValue={(o, v) => o.medium_id === v.medium_id}
            onChange={(_, val) => setSelectedMediumIds(val.map(v => v.medium_id))}
            renderOption={(props, o, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={o.medium_name} />
              </li>
            )}
            renderInput={params => <TextField {...params} label='1. Select Mediums' placeholder='Search...' />}
          />
          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            sx={{ flex: 1 }}
            limitTags={2}
            options={filteredPrograms}
            getOptionLabel={o => o.program_name}
            value={filteredPrograms.filter(p => selectedProgramIds.includes(p.program_id))}
            isOptionEqualToValue={(o, v) => o.program_id === v.program_id}
            onChange={(_, val) => handleProgramChange(val.map(v => v.program_id))}
            renderOption={(props, o, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={o.program_name} />
              </li>
            )}
            renderInput={params => <TextField {...params} label='2. Select Programs' placeholder='Search...' />}
          />
          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            sx={{ flex: 1 }}
            limitTags={2}
            options={filteredAvailableSubjects}
            getOptionLabel={o => o.subject_name}
            disabled={selectedProgramIds.length === 0}
            value={filteredAvailableSubjects.filter(s => selectedSubjectIds.includes(s.subject_id))}
            isOptionEqualToValue={(o, v) => o.subject_id === v.subject_id}
            onChange={(_, val) => handleSubjectChange(val.map(v => v.subject_id))}
            renderOption={(props, o, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={o.subject_name} />
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label='3. Select Subjects'
                placeholder={selectedProgramIds.length === 0 ? 'Select programs first...' : 'Search...'}
              />
            )}
          />
        </Stack>

        <SubjectAssignmentMatrix
          ref={matrixRef}
          availableSubjects={availableSubjects}
          activePrograms={activePrograms}
          selectedSubjectIds={selectedSubjectIds}
          pastData={pastData}
          validMappings={programSubjectData}
          idFieldName='mapping_id' // Uses mapping_id for faculty assignments
          isLoading={isGlobalLoading}
          onSave={handleSave}
        />
      </Box>
    </ChaarvyModal>
  )
}

export default FacultyAssignmentPage
