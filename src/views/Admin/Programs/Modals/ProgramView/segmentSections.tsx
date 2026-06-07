import React, { useEffect, useMemo, useState } from 'react'

import { Button, Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyDataTable, { EditedDataTableOnSubmitPayload } from 'src/reusable_components/Table/ChaarvyDataTable'
import {
  useGetProgramCommonMediumsQuery,
  useGetSectionsListQuery,
  useGetSegmentsByProgramMediumQuery
} from 'src/store/services/listServices'
import {
  useCreateUpdateProgramSegmentSectionMutation,
  useGetProgramSectionListQuery
} from 'src/store/services/programServices'

import { ProgramViewTabProps } from '.'

const SegmentSections = ({ program_id, isLoading }: ProgramViewTabProps) => {
  const custom_id_prefix = 'seating_capacity__'

  const { triggerToast } = useToast()

  const [selectedMedium, setSelectedMedium] = useState<string>()

  const { data: segments, isFetching: isFetchingSegments } = useGetSegmentsByProgramMediumQuery(
    { program_id: program_id ?? '', medium_id: selectedMedium },
    {
      skip: !program_id || !selectedMedium
    }
  )

  const { data: sectionsData, isFetching: isFetchingSections } = useGetSectionsListQuery()

  const { data: segmentMediums } = useGetProgramCommonMediumsQuery(program_id ?? '', {
    skip: !program_id
  })

  const { data: programSections, isFetching: isLoadingData } = useGetProgramSectionListQuery(
    { program_id: program_id ?? '', medium_id: selectedMedium },
    {
      skip: !program_id || !selectedMedium
    }
  )

  useEffect(() => {
    if (segmentMediums) setSelectedMedium(segmentMediums[0]?.medium_id)
  }, [segmentMediums])

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
        editable: true,
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
        .map(([key, value]) => {
          const section_id = key.replace(custom_id_prefix, '')
          const program_section_id = item[`program_section_id__${section_id}`] ?? item.program_section_id

          return {
            ...(program_section_id && { program_section_id }),
            program_id: program_id,
            segment_id: item?.segment_id,
            section_id,
            medium_id: selectedMedium,
            seating_capacity: value
          }
        })
    }

    const payload = [
      ...created,
      ...updated,
      ...deleted.map(each => ({
        ...each,
        [`${custom_id_prefix}${each.section_id}`]: 0,
        [`program_section_id__${each.section_id}`]: each.program_section_id
      }))
    ].flatMap(each => format_data_to_payload(each))

    createUpdateSegmentSection(payload)
      .then(() => triggerToast('Details updated', { variant: ToastVariants.SUCCESS }))
      .catch(e => triggerToast(e, { variant: ToastVariants.ERROR }))
  }

  const data = useMemo(() => {
    if (!programSections || isLoadingData) return []

    const rowMap: Record<string, any> = {}

    programSections.forEach(each => {
      const rowKey = each.segment_id

      if (!rowMap[rowKey]) {
        rowMap[rowKey] = {
          segment_id: each.segment_id,
          program_id: each.program_id
        }
      }

      rowMap[rowKey][`${custom_id_prefix}${each.section_id}`] = each.seating_capacity
      if (each.program_section_id) {
        rowMap[rowKey][`program_section_id__${each.section_id}`] = each.program_section_id
      }
    })

    return Object.values(rowMap)
  }, [programSections, isLoadingData])

  const showDefaultSetButton = useMemo(
    () =>
      !isLoading &&
      !isFetchingSections &&
      !isLoadingData &&
      data.length === 0 && // Directly checking the computed data
      defaultEntryData &&
      defaultEntryData.length > 0,
    [isLoading, isFetchingSections, isLoadingData, data, defaultEntryData] // 'data' is now a dependency
  )

  return (
    <>
      <ChaarvyFlex className={{ gap: 2, flexDirection: 'row', justifyContent: 'end', marginTop: 2 }}>
        {(segmentMediums ?? []).map(each => (
          <Button
            size='small'
            onClick={() => setSelectedMedium(each.medium_id)}
            variant={selectedMedium == each.medium_id ? 'contained' : 'outlined'}
          >
            {each.medium_name}
          </Button>
        ))}
      </ChaarvyFlex>
      <ChaarvyDataTable
        showColumnToggle={false}
        editable
        columns={columns}
        data={data}
        defaultEntryData={defaultEntryData}
        getRowKey={row => `${row?.segment_id}`}
        onSubmit={handleSubmitClick}
        isLoading={isLoading || isFetchingSections || isLoadingData || isFetchingSegments}
        loadingText='Fetching data...'
        isSubmitting={isSubmitting}
        emptyMessage={'No default data found. Please use default data'}
        showDefaultEntryButton={showDefaultSetButton}
      />
    </>
  )
}

export default SegmentSections
