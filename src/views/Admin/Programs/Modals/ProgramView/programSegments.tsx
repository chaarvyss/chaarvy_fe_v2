import React, { useMemo } from 'react'

import { Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyDataTable, { EditedDataTableOnSubmitPayload } from 'src/reusable_components/Table/ChaarvyDataTable'
import { useUpdateProgramSegmentStatusMutation } from 'src/store/services/adminServices'

import { ProgramViewTabProps } from '.'

const ProgramSegmentView = ({ segments, isLoading }: ProgramViewTabProps) => {
  const { triggerToast } = useToast()

  const [updateProgramSegmentStatus, { isLoading: isSubmitting }] = useUpdateProgramSegmentStatusMutation()

  const columns: ChaarvyTableColumn[] = useMemo(() => {
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
      {
        id: 'status',
        inputType: 'checkbox',
        label: 'Status',
        editable: true
      }
    ]
  }, [segments])

  const data = useMemo(() => {
    if (!segments || isLoading) return []

    return segments.map(each => ({
      program_segment_id: each.program_segment_id,
      segment_id: each.segment_id,
      status: each.status == 1
    }))
  }, [segments, isLoading])

  const handleSubmitClick = (data: EditedDataTableOnSubmitPayload) => {
    const { created, updated } = data

    const payload = [...created, ...updated].flatMap(each => ({ ...each, status: each.status ? 1 : 0 }))

    updateProgramSegmentStatus(payload)
      .unwrap()
      .then(() => {
        triggerToast('Segment details updated', { variant: ToastVariants.SUCCESS })
      })
      .catch(e => {
        triggerToast(e, { variant: ToastVariants.ERROR })
      })
  }

  return (
    <>
      <ChaarvyDataTable
        showColumnToggle={false}
        editable
        columns={columns}
        data={data}
        defaultEntryData={[]}
        getRowKey={row => `${row?.segment_id}`}
        onSubmit={handleSubmitClick}
        isLoading={isLoading}
        loadingText='Fetching data...'
        isSubmitting={isSubmitting}
        emptyMessage={'No default data found. Please use default data'}
        shouldHideActions
      />
    </>
  )
}

export default ProgramSegmentView
