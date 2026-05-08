import React, { useState } from 'react'

import { Card, Typography } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'
import { useCreateUpdateFeesTypeMutation } from 'src/store/services/adminServices'
import { useGetFeesTypesListQuery } from 'src/store/services/listServices'
import BulkProcessStatusModal, {
  getDefaultProcessStats,
  getProcessedStats,
  ProcessStatRow
} from 'src/views/common/BulkProcessStatusModal'

const FeesTypes = () => {
  const { triggerToast } = useToast()

  const { data: getFeesTypes, isFetching: isFetchingFeesTypes } = useGetFeesTypesListQuery()

  const [isBulkProcessStatusModalOpen, setIsBulkProcessStatusModalOpen] = useState(false)

  const [processStats, setProcessStats] = useState<ProcessStatRow[]>([])
  const [createUpdateFeesType, { isLoading: isLoadingSaveButton }] = useCreateUpdateFeesTypeMutation()

  const columns: ChaarvyTableColumn[] = [
    {
      id: 's.no',
      label: '#',
      hideable: false,
      width: '10px',
      render: (row, index) => <Typography variant='body1'>{index + 1}</Typography>
    },
    {
      id: 'fees_type',
      editable: true,
      label: 'Fees type',
      render: row => <Typography variant='body1'>{row.fees_type}</Typography>
    }
  ]

  const handleOnSubmit = (data: EditedDataTableOnSubmitPayload) => {
    const { created, updated, deleted } = data

    setProcessStats(getDefaultProcessStats(data))

    setIsBulkProcessStatusModalOpen(true)

    const payload = [
      ...created.map(item => ({ fees_type: item.fees_type, status: 1 })),
      ...updated.map(item => ({ id: item.fees_type_id, ...item, status: 1 })),
      ...deleted.map(item => ({ id: item.fees_type_id, ...item, status: 0 }))
    ]
    createUpdateFeesType(payload)
      .unwrap()
      .then(response => {
        triggerToast('Process completed', { variant: ToastVariants.SUCCESS })
        setProcessStats(prev => getProcessedStats(prev, response))
      })
  }

  return (
    <Card sx={{ padding: 2 }}>
      <Typography variant='h5' sx={{ p: 3 }}>
        Fees Types
      </Typography>
      <ChaarvyDataTable
        getRowKey={(row, index) => row.fees_type_id || `temp-${index}`}
        columns={columns}
        data={isFetchingFeesTypes ? [] : (getFeesTypes ?? [])}
        isLoading={isFetchingFeesTypes}
        emptyMessage={isFetchingFeesTypes ? 'Fetching Fees Types...' : 'No Fees Types available'}
        editable
        onSubmit={handleOnSubmit}
      />
      <BulkProcessStatusModal
        isOpen={isBulkProcessStatusModalOpen}
        onClose={() => {
          setIsBulkProcessStatusModalOpen(false)
          setProcessStats([])
        }}
        isProcessing={isLoadingSaveButton}
        stats={processStats}
      />
    </Card>
  )
}

export default FeesTypes
