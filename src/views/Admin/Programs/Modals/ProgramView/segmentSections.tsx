import React, { useMemo } from 'react'

import { Typography } from '@muiElements'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'
import { useGetSectionsListQuery } from 'src/store/services/listServices'

import { ProgramViewTabProps } from '.'

const SegmentSections = ({ program_id, segments, isLoading }: ProgramViewTabProps) => {
  //   const { triggerToast } = useToast()

  const { data: sectionsData } = useGetSectionsListQuery()

  const columns: ChaarvyTableColumn[] = useMemo(() => {
    const sectionColumns: ChaarvyTableColumn[] = (sectionsData ?? []).map(each => ({
      id: `seating_capacity`,
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
        options: (segments ?? []).map(segment => ({ value: segment.segment_id, label: segment.segment_name }))
      },
      ...sectionColumns
    ]
  }, [segments, sectionsData])

  const defaultEntryData = useMemo(() => {
    if (!segments?.length || !sectionsData?.length) return []

    const sectionDefaults = (sectionsData ?? []).reduce<Record<string, number>>((acc, {}) => {
      acc[`seating_capacity`] = 0

      return acc
    }, {})

    return segments.map(({ segment_id }) => ({
      segment_id,
      program_id,
      ...sectionDefaults
    }))
  }, [segments, sectionsData])

  const data = [
    {
      segment_id: '3d7c40f3-e26c-437f-98fd-a6aad6abe775',
      program_id: '1d9c747a-770f-447f-8cc1-82904dadde68',
      seating_capacity: '23'
    }
  ]

  const handleSubmitClick = (data: EditedDataTableOnSubmitPayload) => {
    const { created, updated } = data

    console.log({ created, updated })
  }

  const showDefaultSetButton = useMemo(() => !isLoading, [isLoading])

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
        isLoading={isLoading}
        loadingText='Fetching data...'
        isSubmitting={false}
        emptyMessage={'No default data found. Please use default data'}
        showDefaultEntryButton={showDefaultSetButton}
      />
    </>
  )
}

export default SegmentSections
