'use client'

import { Autocomplete, Box, Checkbox, ListItemText, Stack, TextField } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { ChaarvyModal } from 'src/reusable_components'
import { SubjectAssignmentMatrix, SubjectAssignmentMatrixHandle } from 'src/reusable_components/SubjectAssignmentMatrix'
import { useGetSubjectsListQuery } from 'src/store/services/listServices'
import {
  useAssignProgramSegmentSubjectMutation,
  useGetAllProgramSegmentsListQuery,
  useGetProgramSegmentSubjectsListQuery
} from 'src/store/services/programServices'
import { useDebounce } from 'src/utils/hooks/useDebounce'

export function SubjectAssignmentPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [filterProps] = useState({ limit: 100, offset: 0, status_: '1' })
  const filterP = useDebounce(filterProps, 500)
  const { triggerToast } = useToast()

  const { data: subjectsList, isLoading, isFetching } = useGetSubjectsListQuery(filterP)
  const { data: programSegmentsData, isFetching: isProgramSegmentsLoading } = useGetAllProgramSegmentsListQuery()
  const { data: pastData, refetch: refetchPastData } = useGetProgramSegmentSubjectsListQuery(undefined)
  const [submitData] = useAssignProgramSegmentSubjectMutation()

  const [programs, setPrograms] = useState<any[]>([])
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const matrixRef = useRef<SubjectAssignmentMatrixHandle>(null)

  useEffect(() => {
    if (programSegmentsData) {
      const grouped: Record<string, any> = {}
      programSegmentsData.forEach((seg: any) => {
        if (!grouped[seg.program_id])
          grouped[seg.program_id] = { program_id: seg.program_id, program_name: seg.program_name, segments: [] }
        grouped[seg.program_id].segments.push({ segment_id: seg.segment_id, segment_name: seg.segment_name })
      })
      setPrograms(Object.values(grouped))
    }
  }, [programSegmentsData])

  useEffect(() => {
    if (!pastData) return
    const active = pastData.filter((d: any) => d.status === 1)
    setSelectedSubjectIds(Array.from(new Set(active.map((d: any) => d.subject_id))))
    const assignedProgs = Array.from(new Set(active.map((d: any) => d.program_id)))
    setSelectedProgramIds(assignedProgs.length > 0 ? assignedProgs : programs.map(p => p.program_id))
  }, [pastData, programs])

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

  const handleProgramChange = useCallback(
    (newIds: string[]) => {
      const added = newIds.filter(id => !selectedProgramIds.includes(id))
      let nextSubs = [...selectedSubjectIds]

      if (added.length > 0 && pastData) {
        const newSubs = pastData
          .filter((d: any) => d.status === 1 && added.includes(d.program_id))
          .map((d: any) => d.subject_id)
        nextSubs = Array.from(new Set([...nextSubs, ...newSubs]))
      }

      // Auto-cleanup unassigned subjects
      const removed = selectedProgramIds.filter(id => !newIds.includes(id))
      if (removed.length > 0) {
        nextSubs = nextSubs.filter(subId => matrixRef.current?.hasAssignments(subId, newIds))
      }

      setSelectedProgramIds(newIds)
      setSelectedSubjectIds(nextSubs)
    },
    [selectedProgramIds, selectedSubjectIds, pastData]
  )

  const handleSubjectChange = useCallback(
    (newIds: string[]) => {
      const removed = selectedSubjectIds.filter(id => !newIds.includes(id))
      for (const subId of removed) {
        if (matrixRef.current?.hasAssignments(subId, selectedProgramIds)) {
          triggerToast('Cannot uncheck subject. It is assigned to an active segment.', { variant: ToastVariants.ERROR })

          return
        }
      }
      setSelectedSubjectIds(newIds)
    },
    [selectedSubjectIds, selectedProgramIds, triggerToast]
  )

  const handleSave = async (payload: any[]) => {
    await submitData(payload).unwrap()
    refetchPastData()
  }

  const isGlobalLoading = isLoading || isFetching || isProgramSegmentsLoading

  return (
    <ChaarvyModal isOpen={isOpen} modalSize='col-12 col-md-10' onClose={onClose} title='Subject Assignment'>
      <Box sx={{ width: '100%', px: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            limitTags={2}
            sx={{ flex: 1 }}
            options={programs}
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
            renderInput={params => <TextField {...params} label='Select Programs' placeholder='Search...' />}
          />
          <Autocomplete
            multiple
            size='small'
            disableCloseOnSelect
            limitTags={2}
            sx={{ flex: 1 }}
            options={availableSubjects}
            getOptionLabel={o => o.subject_name}
            value={availableSubjects.filter(s => selectedSubjectIds.includes(s.subject_id))}
            isOptionEqualToValue={(o, v) => o.subject_id === v.subject_id}
            onChange={(_, val) => handleSubjectChange(val.map(v => v.subject_id))}
            renderOption={(props, o, { selected }) => (
              <li {...props}>
                <Checkbox sx={{ mr: 1 }} checked={selected} size='small' />
                <ListItemText primary={o.subject_name} />
              </li>
            )}
            renderInput={params => <TextField {...params} label='Select Subjects' placeholder='Search...' />}
          />
        </Stack>

        <SubjectAssignmentMatrix
          ref={matrixRef}
          availableSubjects={availableSubjects}
          activePrograms={activePrograms}
          selectedSubjectIds={selectedSubjectIds}
          pastData={pastData ?? []}
          idFieldName='progSegmentSubId'
          isLoading={isGlobalLoading}
          onSave={handleSave}
        />
      </Box>
    </ChaarvyModal>
  )
}

export default SubjectAssignmentPage
