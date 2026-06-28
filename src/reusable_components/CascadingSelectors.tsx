import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { ProgramSegmentMediumsListResponse } from 'src/lib/types'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useGetProgramSegmentMediumsListByProgramIdQuery } from 'src/store/services/programServices'

import ReusableSelect from './reusableSelect'

export type CascadingSelectorState = {
  program?: string | string[]
  segment?: string | string[]
  medium?: string | string[]
}

interface CascadingSelectorsProps {
  onChange: (values: CascadingSelectorState) => void
  defaultValues?: CascadingSelectorState
  isMultiProgram?: boolean
  isMultiSegment?: boolean
  isMultiMedium?: boolean
}

// Helper component to handle rendering Multi-Select vs Single-Select
const DynamicSelect = ({
  label,
  value,
  options,
  isLoading,
  isMulti,
  onChange
}: {
  label: string
  value: string | string[] | undefined
  options: { value: string; label: string }[]
  isLoading: boolean
  isMulti: boolean
  onChange: (val: string | string[]) => void
}) => {
  if (isMulti) {
    const handleMultiChange = (event: SelectChangeEvent<string[]>) => {
      const {
        target: { value: selectedValue }
      } = event
      onChange(typeof selectedValue === 'string' ? selectedValue.split(',') : selectedValue)
    }

    const arrayValue = (value as string[]) || []

    return (
      <FormControl size='small' sx={{ minWidth: 200 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          multiple
          value={arrayValue}
          onChange={handleMultiChange}
          input={<OutlinedInput label={label} />}
          renderValue={selected => `${selected.length} Selected`}
        >
          {options.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              <Checkbox checked={arrayValue.includes(opt.value)} />
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  // Fallback to your custom single select
  return (
    <ReusableSelect
      label={label}
      value={(value as string) || ''}
      isLoading={isLoading}
      options={options}
      onChange={onChange as (value: string | string[]) => void}
      fullWidth={false}
    />
  )
}

const CascadingSelectors = ({
  onChange,
  defaultValues,
  isMultiProgram = false,
  isMultiSegment = false,
  isMultiMedium = false
}: CascadingSelectorsProps) => {
  const [values, setValues] = useState<CascadingSelectorState>(
    defaultValues ?? {
      program: isMultiProgram ? [] : '',
      segment: isMultiSegment ? [] : '',
      medium: isMultiMedium ? [] : ''
    }
  )

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsListQuery(true)

  // Use the first program in the array to fetch dependent segments/mediums to prevent API errors
  const firstProgramId = Array.isArray(values.program) ? values.program[0] : values.program

  const { data: programSegmentMediumsResponse, isFetching: isProgramSegmentMediumsLoading } =
    useGetProgramSegmentMediumsListByProgramIdQuery(
      {
        program_id: firstProgramId ?? '',
        only_active: true
      },
      {
        skip: !firstProgramId
      }
    )

  const getUniqueLists = (data: ProgramSegmentMediumsListResponse[]) => {
    const mediums = [
      ...new Map(
        data.map(item => [
          item.medium_id,
          {
            medium_id: item.medium_id,
            medium_name: item.medium_name
          }
        ])
      ).values()
    ]

    const segments = [
      ...new Map(
        data.map(item => [
          item.segment_id,
          {
            segment_id: item.segment_id,
            segment_name: item.segment_name
          }
        ])
      ).values()
    ]

    return { mediums, segments }
  }

  const { mediums: mediumsData, segments: segmentData } = useMemo(() => {
    return getUniqueLists(programSegmentMediumsResponse || [])
  }, [programSegmentMediumsResponse])

  useEffect(() => {
    if (defaultValues) {
      setValues(defaultValues)
    }
  }, [defaultValues])

  const handleProgramChange = (value: string | string[]) => {
    setValues({
      program: value,
      segment: isMultiSegment ? [] : undefined,
      medium: isMultiMedium ? [] : undefined
    })
  }

  const handleSegmentChange = (value: string | string[]) => {
    setValues(prev => ({ ...prev, segment: value }))
  }

  const handleMediumChange = (value: string | string[]) => {
    setValues(prev => ({ ...prev, medium: value }))
  }

  useEffect(() => {
    onChange?.(values)
  }, [values])

  return (
    <ChaarvyFlex className={{ gap: 3 }}>
      <DynamicSelect
        label='Program'
        value={values.program}
        isLoading={isProgramsLoading}
        isMulti={isMultiProgram}
        onChange={handleProgramChange}
        options={(programsData ?? []).map(p => ({
          value: p.program_id,
          label: p.program_name
        }))}
      />

      <DynamicSelect
        label='Segment'
        value={values.segment}
        isLoading={isProgramSegmentMediumsLoading}
        isMulti={isMultiSegment}
        onChange={handleSegmentChange}
        options={(segmentData ?? []).map(s => ({
          value: s.segment_id,
          label: s.segment_name
        }))}
      />

      <DynamicSelect
        label='Medium'
        value={values.medium}
        isLoading={isProgramSegmentMediumsLoading}
        isMulti={isMultiMedium}
        onChange={handleMediumChange}
        options={(mediumsData ?? []).map(m => ({
          value: m.medium_id ?? '',
          label: m.medium_name
        }))}
      />
    </ChaarvyFlex>
  )
}

export default CascadingSelectors
