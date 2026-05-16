import React, { useMemo } from 'react'

import { Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'
import { useGetSectionsListQuery } from 'src/store/services/listServices'
import {
  useCreateUpdateProgramSegmentSectionMutation,
  useGetProgramSectionListQuery
} from 'src/store/services/programServices'

import { ProgramViewTabProps } from '.'

const SegmentSections = ({ program_id, segments, isLoading }: ProgramViewTabProps) => {
  const custom_id_prefix = 'seating_capacity__'

  const { triggerToast } = useToast()

  const { data: sectionsData, isFetching: isFetchingSections } = useGetSectionsListQuery()

  const { data: programSections, isFetching: isLoadingData } = useGetProgramSectionListQuery(program_id ?? '', {
    skip: !program_id
  })

  const [createUpdateSegmentSection, { isLoading: isSubmitting }] = useCreateUpdateProgramSegmentSectionMutation()

  const columns: ChaarvyTableColumn[] = useMemo(() => {
    const sectionColumns: ChaarvyTableColumn[] = (sectionsData ?? []).map(each => ({
      id: `${custom_id_prefix}${each.section_id}`,
      label: each.section_name,
      editable: true,
      width: 90,
      inputType: 'number'
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
      ...sectionColumns
    ]
  }, [segments, sectionsData])

  const defaultEntryData = useMemo(() => {
    if (!segments?.length || !sectionsData?.length) return []

    const sectionDefaults = (sectionsData ?? []).reduce<Record<string, number>>((acc, { section_id }) => {
      acc[`${custom_id_prefix}${section_id}`] = 0

      return acc
    }, {})

    return segments.map(({ segment_id }) => ({
      segment_id,
      program_id,
      ...sectionDefaults
    }))
  }, [segments, sectionsData])

  const handleSubmitClick = (data: EditedDataTableOnSubmitPayload) => {
    const { created, updated, deleted } = data

    const format_data_to_payload = (item: any) => {
      return Object.entries(item)
        .filter(([key]) => key.startsWith(custom_id_prefix))
        .map(([key, value]) => ({
          ...(item?.program_section_id && { program_section_id: item.program_section_id }),
          program_id: program_id,
          segment_id: item?.segment_id,
          section_id: key.replace(custom_id_prefix, ''),
          seating_capacity: value
        }))
    }

    const payload = [
      ...created,
      ...updated,
      ...deleted.map(each => ({ ...each, [`${custom_id_prefix}${each.section_id}`]: 0 }))
    ].flatMap(each => format_data_to_payload(each))

    createUpdateSegmentSection(payload)
      .then(() => triggerToast('Details updated', { variant: ToastVariants.SUCCESS }))
      .catch(e => triggerToast(e, { variant: ToastVariants.ERROR }))
  }

  const data = useMemo(() => {
    if (!programSections || isLoadingData) return []

    return programSections.map(each => ({
      ...each,
      [`${custom_id_prefix}${each.section_id}`]: each.seating_capacity
    }))
  }, [programSections, isLoadingData])

  const showDefaultSetButton = useMemo(
    () => !isLoading && !isFetchingSections && !isLoadingData && data.length == 0,
    [isLoading, isFetchingSections, isLoadingData, data]
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
        isLoading={isLoading || isFetchingSections || isLoadingData}
        loadingText='Fetching data...'
        isSubmitting={isSubmitting}
        emptyMessage={'No default data found. Please use default data'}
        showDefaultEntryButton={showDefaultSetButton}
      />
    </>
  )
}

export default SegmentSections
