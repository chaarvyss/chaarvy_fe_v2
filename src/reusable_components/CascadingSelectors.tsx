import { useEffect, useState } from 'react'

import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useLazyGetProgramMediumsListQuery } from 'src/store/services/programServices'
import { useLazyGetProgramSegmentDetailsQuery } from 'src/store/services/viewServices'

import ReusableSelect from './reusableSelect'

export interface CascadingSelectorState {
  program?: string
  segment?: string
  medium?: string
}

interface CascadingSelectorsProps {
  onChange: (values: CascadingSelectorState) => void
  defaultValues?: CascadingSelectorState
}

const CascadingSelectors = ({ onChange, defaultValues }: CascadingSelectorsProps) => {
  const [values, setValues] = useState<CascadingSelectorState>(defaultValues ?? {})

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsListQuery(true)

  const [fetchSegments, { data: segmentData, isFetching: isSegmentsLoading }] = useLazyGetProgramSegmentDetailsQuery()

  const [fetchMediums, { data: mediumsData, isFetching: isMediumsLoading }] = useLazyGetProgramMediumsListQuery()

  const handleProgramChange = (value: string) => {
    setValues({
      program: value,
      segment: undefined,
      medium: undefined
    })

    fetchSegments(value)
    fetchMediums(value)
  }

  const handleSegmentChange = (value: string) => {
    setValues(prev => ({ ...prev, segment: value }))
  }

  const handleMediumChange = (value: string) => {
    setValues(prev => ({ ...prev, medium: value }))
  }

  useEffect(() => {
    if (defaultValues?.program) {
      fetchSegments(defaultValues?.program)
      fetchMediums(defaultValues?.program)
    }
  }, [])

  useState(() => {
    onChange?.(values)
  })

  return (
    <ChaarvyFlex className={{ gap: 3 }}>
      <ReusableSelect
        label='Program'
        value={values.program}
        isLoading={isProgramsLoading}
        options={(programsData ?? []).map(p => ({
          value: p.program_id,
          label: p.program_name
        }))}
        onChange={handleProgramChange}
        fullWidth={false}
      />

      <ReusableSelect
        label='Segment'
        value={values.segment}
        isLoading={isSegmentsLoading}
        options={(segmentData ?? []).map(s => ({
          value: s.program_segment_id,
          label: s.segment_name
        }))}
        onChange={handleSegmentChange}
        fullWidth={false}
      />

      <ReusableSelect
        label='Medium'
        value={values.medium}
        isLoading={isMediumsLoading}
        options={(mediumsData ?? []).map(m => ({
          value: m.language_id,
          label: m.language_name
        }))}
        onChange={handleMediumChange}
        fullWidth={false}
      />
    </ChaarvyFlex>
  )
}

export default CascadingSelectors
