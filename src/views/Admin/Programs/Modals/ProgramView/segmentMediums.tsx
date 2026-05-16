import React, { useMemo } from 'react'

import { Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'
import {
  useCreateUpdateProgramSegmentMediumMutation,
  useGetProgramSegmentMediumsListQuery
} from 'src/store/services/programServices'

import { ProgramViewTabProps } from '.'

const SegmentMediums = ({ program_id, segments, languages, isLoading }: ProgramViewTabProps) => {
  const { triggerToast } = useToast()

  const [createUpdateData, { isLoading: isSubmitting }] = useCreateUpdateProgramSegmentMediumMutation()

  const { data: programSegmentMediumsResponse, isFetching: isFetchingData } = useGetProgramSegmentMediumsListQuery(
    program_id ?? '',
    {
      skip: !program_id
    }
  )

  const columns: ChaarvyTableColumn[] = useMemo(() => {
    const languagesColumns: ChaarvyTableColumn[] = (languages ?? []).map(each => ({
      id: `lgid__${each.languages_id}`,
      label: each.languages_name,
      editable: true,
      inputType: 'checkbox'
    }))

    return [
      {
        id: 'sno',
        label: '#',
        width: 30,
        render: (_, index) => <Typography variant='body2'>{index + 1}</Typography>
      },

      {
        id: 'segment_id',
        inputType: 'select',
        label: 'Segments',
        editable: false,
        uniqueOptionsOnly: true,
        options: (segments ?? []).map(segment => ({ value: segment.segment_id, label: segment.segment_name }))
      },
      ...languagesColumns
    ]
  }, [segments, languages])

  const defaultEntryData = useMemo(() => {
    if (!segments?.length || !languages?.length) return []

    const getValue = (name: string) => {
      const lower = name.toLowerCase()

      return lower.startsWith('eng') || lower.startsWith('tel')
    }

    const languageDefaults = Object.fromEntries(
      languages.map(({ languages_id, languages_name }) => [`lgid__${languages_id}`, getValue(languages_name)])
    )

    return segments.map(({ segment_id }) => ({
      segment_id,
      ...languageDefaults
    }))
  }, [segments, languages])

  const data = useMemo(() => {
    if (!programSegmentMediumsResponse || isFetchingData) return []
    const obs: Record<string, any> = {}
    programSegmentMediumsResponse.forEach(each => {
      if (!each.segment) return

      obs[each?.segment] = {
        ...obs[each?.segment],
        segment_id: each.segment,
        [`lgid__${each.medium}`]: each.status === 1
      }
    })

    return Object.values(obs)
  }, [programSegmentMediumsResponse, isFetchingData])

  const handleSubmitClick = (data: EditedDataTableOnSubmitPayload) => {
    const format_data_to_payload = (item: any) => {
      return Object.entries(item)
        .filter(([key]) => key.startsWith('lgid__'))
        .map(([key, value]) => ({
          ...(item?.program_segment_medium_id && { uid: item.program_segment_medium_id }),
          program: program_id,
          segment: item?.segment_id,
          medium: key.replace('lgid__', ''),
          status: value ? 1 : 0
        }))
    }

    const { created, updated } = data
    const payload = [...created, ...updated].flatMap(each => format_data_to_payload(each))

    createUpdateData(payload)
      .unwrap()
      .then(() => triggerToast('Process completed', { variant: ToastVariants.SUCCESS }))
      .catch(e => {
        triggerToast(e, { variant: ToastVariants.ERROR })
      })
  }

  const showDefaultSetButton = useMemo(
    () => !isLoading && !isFetchingData && programSegmentMediumsResponse?.length == 0,
    [isLoading, isFetchingData, programSegmentMediumsResponse]
  )

  return (
    <>
      <ChaarvyDataTable
        showColumnToggle={false}
        editable
        columns={columns}
        data={data}
        defaultEntryData={defaultEntryData}
        getRowKey={row => `${row?.segment_id}`}
        onSubmit={handleSubmitClick}
        isLoading={isLoading || isFetchingData}
        loadingText='Fetching data...'
        isSubmitting={isSubmitting}
        emptyMessage={'No default data found. Please use default data'}
        showDefaultEntryButton={showDefaultSetButton}
        shouldHideActions
      />
    </>
  )
}

export default SegmentMediums
