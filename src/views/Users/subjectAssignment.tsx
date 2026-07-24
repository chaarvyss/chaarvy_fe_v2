'use client'

import { Autocomplete, Box, Checkbox, ListItemText, Stack, TextField } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ChaarvyModal } from 'src/reusable_components'
import {
  SubjectAssignmentMatrix,
  SubjectAssignmentMatrixHandle,
  useAssignmentMatrixHandlers
} from 'src/reusable_components/SubjectAssignmentMatrix'
import { useGetSubjectsListQuery } from 'src/store/services/listServices'
import {
  useGetActiveProgramMediumsQuery,
  useGetProgramSegmentsByMediumsQuery,
  useGetProgramSegmentSubjectsListQuery,
  useGetUserSubjectsQuery,
  useUserSubjectSyncMutation
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
  const { data: mediumsList } = useGetActiveProgramMediumsQuery()

  const [saveDetails] = useUserSubjectSyncMutation()

  const { triggerToast } = useToast()

  const { data: subjectsList, isFetching: isSubjectsLoading } = useGetSubjectsListQuery({
    limit: 500,
    offset: 0,
    status_: '1'
  })

  const [programs, setPrograms] = useState<any[]>([])

  const [selectedMediumId, setSelectedMediumId] = useState<string | null>(null)
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const { data: programSegmentsData, isFetching: isProgramsLoading } = useGetProgramSegmentsByMediumsQuery(
    { medium_ids: selectedMediumId ? [selectedMediumId] : [] },
    { skip: !selectedMediumId }
  )

  const { data: programSubjectData, isFetching: isMappingsLoading } = useGetProgramSegmentSubjectsListQuery(undefined)

  const { data: userSubjectsData, isFetching: isUserSubjectsLoading } = useGetUserSubjectsQuery(facultyId, {
    skip: !facultyId
  })

  const matrixRef = useRef<SubjectAssignmentMatrixHandle>(null)

  useEffect(() => {
    if (programSegmentsData && Array.isArray(programSegmentsData)) {
      const grouped: Record<string, any> = {}

      programSegmentsData.forEach((seg: any) => {
        if (!grouped[seg.program_id]) {
          grouped[seg.program_id] = {
            program_id: seg.program_id,
            program_name: seg.program_name,
            segments: []
          }
        }

        const exists = grouped[seg.program_id].segments.some((s: any) => s.segment_id === seg.segment_id)
        if (!exists) {
          grouped[seg.program_id].segments.push({
            segment_id: seg.segment_id,
            segment_name: seg.segment_name
          })
        }
      })

      setPrograms(Object.values(grouped))
    } else {
      setPrograms([])
    }
  }, [programSegmentsData])

  const [hasInitialized, setHasInitialized] = useState(false)

  // @ts-ignore (Remove ts-ignore if you have UserSubject imported/defined properly)
  const pastData = useMemo(() => userSubjectsData ?? [], [userSubjectsData])

  // FIX: Wait for isUserSubjectsLoading to be false before trying to initialize
  useEffect(() => {
    if (!isOpen || hasInitialized || isUserSubjectsLoading) return

    const active = pastData.filter((d: any) => d.status === 1)
    const uniqueMediums = Array.from(new Set(active.map((d: any) => d.medium_id).filter(Boolean)))

    if (uniqueMediums.length > 0) {
      const firstMedium = uniqueMediums[0] as string
      setSelectedMediumId(firstMedium)

      const activeForMedium = active.filter((d: any) => d.medium_id === firstMedium)
      setSelectedProgramIds(Array.from(new Set(activeForMedium.map((d: any) => d.program_id))))
      setSelectedSubjectIds(Array.from(new Set(activeForMedium.map((d: any) => d.subject_id))))
    }

    setHasInitialized(true)
  }, [pastData, isOpen, hasInitialized, isUserSubjectsLoading])

  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false)
      setSelectedMediumId(null)
      setSelectedProgramIds([])
      setSelectedSubjectIds([])
      setPrograms([])
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

  const activePrograms = useMemo(
    () => programs.filter(p => selectedProgramIds.includes(p.program_id)),
    [programs, selectedProgramIds]
  )

  const validSubjectIdsForPrograms = useMemo(() => {
    const validIds = new Set<string>()
    ;(programSubjectData || []).forEach((m: any) => {
      if (m.status === 1 && selectedProgramIds.includes(m.program_id)) {
        validIds.add(m.subject_id)
      }
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

  const handleMediumChange = (newMediumId: string | null) => {
    setSelectedMediumId(newMediumId)

    if (!newMediumId) {
      setSelectedProgramIds([])
      setSelectedSubjectIds([])

      return
    }

    const activeForNewMedium = pastData.filter((d: any) => d.status === 1 && d.medium_id === newMediumId)

    setSelectedProgramIds(Array.from(new Set(activeForNewMedium.map((d: any) => d.program_id))))
    setSelectedSubjectIds(Array.from(new Set(activeForNewMedium.map((d: any) => d.subject_id))))
  }

  const handleSave = async (payload: any[]) => {
    if (!selectedMediumId) {
      console.error('No medium selected. Cannot save.')

      return
    }
    const finalPayload = {
      user_id: facultyId,
      medium_ids: [selectedMediumId],
      data: payload.map(item => ({
        ...item
      }))
    }
    saveDetails(finalPayload)
      .unwrap()
      .then(() => {
        triggerToast('User subjects synced successfully.', {
          variant: ToastVariants.SUCCESS
        })
      })
      .catch(err => {
        triggerToast(err, {
          variant: ToastVariants.ERROR
        })
      })
  }

  const isGlobalLoading = isSubjectsLoading || isProgramsLoading || isMappingsLoading || isUserSubjectsLoading

  const currentMediumPastData = useMemo(() => {
    return pastData.filter((d: any) => d.medium_id === selectedMediumId)
  }, [pastData, selectedMediumId])

  return (
    <ChaarvyModal isOpen={isOpen} modalSize='col-12 col-md-11' onClose={onClose} title='Faculty Subject Assignment'>
      <Box sx={{ width: '100%', px: 4 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} mb={3}>
          <Autocomplete
            size='small'
            sx={{ flex: 1 }}
            options={availableMediums}
            getOptionLabel={o => o.medium_name}
            value={availableMediums.find(m => m.medium_id === selectedMediumId) || null}
            isOptionEqualToValue={(o, v) => o.medium_id === v.medium_id}
            onChange={(_, val) => handleMediumChange(val ? val.medium_id : null)}
            renderInput={params => <TextField {...params} label='1. Select Medium' placeholder='Search...' />}
          />

          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            sx={{ flex: 1 }}
            limitTags={2}
            options={programs}
            disabled={!selectedMediumId}
            getOptionLabel={o => o.program_name}
            value={programs.filter(p => selectedProgramIds.includes(p.program_id))}
            isOptionEqualToValue={(o, v) => o.program_id === v.program_id}
            onChange={(_, val) => handleProgramChange(val.map(v => v.program_id))}
            renderOption={(props, o, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={o.program_name} />
              </li>
            )}
            renderInput={params => (
              <TextField
                {...params}
                label='2. Select Programs'
                placeholder={!selectedMediumId ? 'Select medium first...' : 'Search...'}
              />
            )}
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

        {selectedMediumId && (
          <SubjectAssignmentMatrix
            key={selectedMediumId}
            ref={matrixRef}
            availableSubjects={availableSubjects}
            activePrograms={activePrograms}
            selectedSubjectIds={selectedSubjectIds}
            pastData={currentMediumPastData}
            validMappings={programSubjectData}
            idFieldName='user_subject_id'
            isLoading={isGlobalLoading}
            onSave={handleSave}
          />
        )}
      </Box>
    </ChaarvyModal>
  )
}

export default FacultyAssignmentPage
