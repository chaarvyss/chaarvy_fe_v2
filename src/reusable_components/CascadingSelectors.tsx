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
  segment?: string
  medium?: string
}

interface CascadingSelectorsProps {
  onChange: (values: CascadingSelectorState) => void
  defaultValues?: CascadingSelectorState
  isMultiProgram?: boolean // NEW: Enables multi-select for the Program dropdown
}

const CascadingSelectors = ({ onChange, defaultValues, isMultiProgram = false }: CascadingSelectorsProps) => {
  const [values, setValues] = useState<CascadingSelectorState>(defaultValues ?? { program: isMultiProgram ? [] : '' })

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

  const handleProgramChangeSingle = (value: string) => {
    setValues({
      program: value,
      segment: undefined,
      medium: undefined
    })
  }

  const handleProgramChangeMulti = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value }
    } = event
    const newPrograms = typeof value === 'string' ? value.split(',') : value
    setValues({
      program: newPrograms,
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
      {isMultiProgram ? (
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Program</InputLabel>
          <Select
            multiple
            value={(values.program as string[]) || []}
            onChange={handleProgramChangeMulti}
            input={<OutlinedInput label='Program' />}
            renderValue={selected => `${selected.length} Selected`}
          >
            {(programsData ?? []).map(prog => (
              <MenuItem key={prog.program_id} value={prog.program_id}>
                <Checkbox checked={((values.program as string[]) || []).includes(prog.program_id)} />
                <ListItemText primary={prog.program_name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <ReusableSelect
          label='Program'
          value={values.program as string}
          isLoading={isProgramsLoading}
          options={(programsData ?? []).map(p => ({
            value: p.program_id,
            label: p.program_name
          }))}
          onChange={handleProgramChangeSingle}
          fullWidth={false}
        />
      )}

      <ReusableSelect
        label='Segment'
        value={values.segment}
        isLoading={isProgramSegmentMediumsLoading}
        options={(segmentData ?? []).map(s => ({
          value: s.segment_id,
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
          value: m.medium_id ?? '',
          label: m.medium_name
        }))}
        onChange={handleMediumChange}
        fullWidth={false}
      />
    </ChaarvyFlex>
  )
}

export default CascadingSelectors
