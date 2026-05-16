import { useEffect, useMemo, useState } from 'react'

import { ProgramSegmentMediumsListResponse } from 'src/lib/types'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useGetProgramSegmentMediumsListByProgramIdQuery } from 'src/store/services/programServices'

import ReusableSelect from './reusableSelect'

export type CascadingSelectorState = {
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

  const { data: programSegmentMediumsResponse, isFetching: isProgramSegmentMediumsLoading } =
    useGetProgramSegmentMediumsListByProgramIdQuery(
      {
        program_id: values.program ?? '',
        only_active: true
      },
      {
        skip: !values.program
      }
    )

  const segmentData = useMemo(() => {
    const seen = new Set<string>()

    return (programSegmentMediumsResponse ?? []).reduce<ProgramSegmentMediumsListResponse[]>((segments, item) => {
      if (!seen.has(item.segment)) {
        seen.add(item.segment)
        segments.push(item)
      }

      return segments
    }, [])
  }, [programSegmentMediumsResponse])

  const mediumsData = useMemo(() => {
    const seen = new Set<string>()

    return (programSegmentMediumsResponse ?? [])
      .filter(item => !values.segment || item.segment === values.segment)
      .reduce<ProgramSegmentMediumsListResponse[]>((mediums, item) => {
        if (!seen.has(item.medium)) {
          seen.add(item.medium)
          mediums.push(item)
        }

        return mediums
      }, [])
  }, [programSegmentMediumsResponse, values.segment])

  useEffect(() => {
    if (defaultValues) {
      setValues(defaultValues)
    }
  }, [defaultValues])

  const handleProgramChange = (value: string) => {
    setValues({
      program: value,
      segment: undefined,
      medium: undefined
    })
  }

  const handleSegmentChange = (value: string) => {
    setValues(prev => ({ ...prev, segment: value }))
  }

  const handleMediumChange = (value: string) => {
    setValues(prev => ({ ...prev, medium: value }))
  }

  useEffect(() => {
    onChange?.(values)
  }, [values])

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
        isLoading={isProgramSegmentMediumsLoading}
        options={(segmentData ?? []).map(s => ({
          value: s.segment,
          label: s.segment_name
        }))}
        onChange={handleSegmentChange}
        fullWidth={false}
      />

      <ReusableSelect
        label='Medium'
        value={values.medium}
        isLoading={isProgramSegmentMediumsLoading}
        options={(mediumsData ?? []).map(m => ({
          value: m.medium ?? '',
          label: m.medium_name
        }))}
        onChange={handleMediumChange}
        fullWidth={false}
      />
    </ChaarvyFlex>
  )
}

export default CascadingSelectors
