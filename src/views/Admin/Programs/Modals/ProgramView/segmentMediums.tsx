import React, { useEffect, useMemo, useState } from 'react'

import { Typography } from '@muiElements'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'

import { ProgramViewTabProps } from '.'

const SegmentMediums = ({ segments, languages, isLoading }: ProgramViewTabProps) => {
  const [showDefaultSetButton, setShowDefaultSetButton] = useState<boolean>(false)
  useEffect(() => {
    setShowDefaultSetButton(true)
  }, [])

  const columns: ChaarvyTableColumn[] = useMemo(() => {
    const languagesColumns: ChaarvyTableColumn[] = (languages ?? []).map(each => ({
      id: each.languages_id,
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
        options: (segments ?? []).map(segment => ({ value: segment.segment_id, label: segment.segment_name }))
      },
      ...languagesColumns
    ]
  }, [segments, languages])

  const defaultEntryData = useMemo(() => {
    if (!segments || !languages) return []

    const language_ids = languages.map(({ languages_id }) => languages_id)

    return segments.map(({ segment_id }) => ({
      segment_id,
      ...Object.fromEntries(language_ids.map(languageId => [`lgid__${languageId}`, false]))
    }))
  }, [segments, languages])

  const data = [
    // {
    //   '67abe199-4a38-4559-92ac-a003ca11eeae': true,
    //   segment_id: 'ca15f750-335f-44ae-8b6e-a5832e34fcca'
    // }
  ]

  const handleSubmitClick = (data: EditedDataTableOnSubmitPayload) => {
    const { created, updated, deleted } = data
    console.log(created, updated, deleted)
  }

  return (
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
      emptyMessage={''}
      showDefaultEntryButton={showDefaultSetButton}
      shouldHideActions
    />
  )
}

export default SegmentMediums
