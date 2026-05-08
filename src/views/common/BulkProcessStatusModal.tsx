import { Box, Grid, Typography, CircularProgress } from '@mui/material'
import React from 'react'

import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { EditedDataTableOnSubmitPayload } from 'src/reusable_components/Table/ChaarvyDataTable'

export interface BulkProcessResponse {
  success_created: number
  success_updated: number
  skipped: number
  failed: number
  exceptions: string[]
}

const enum ProcessStatIds {
  SUCCESS_CREATED = 'success_created',
  SUCCESS_UPDATED = 'success_updated',
  SKIPPED = 'skipped',
  FAILED = 'failed',
  EXCEPTIONS = 'exceptions'
}
export interface ProcessStatRow {
  id: ProcessStatIds
  label: string
  target: number
  processed: number
  exceptions?: string[]
}

export interface BulkProcessStatusModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  isProcessing?: boolean
  stats: ProcessStatRow[]
}

export const getDefaultProcessStats = (data: EditedDataTableOnSubmitPayload) => {
  const { created, updated, deleted } = data

  return [
    { id: ProcessStatIds.SUCCESS_CREATED, label: 'Creating', target: created.length, processed: 0 },
    { id: ProcessStatIds.SUCCESS_UPDATED, label: 'Updating', target: [...updated, ...deleted].length, processed: 0 },
    { id: ProcessStatIds.SKIPPED, label: 'Skipped', target: 0, processed: 0 },
    { id: ProcessStatIds.FAILED, label: 'Failed', target: 0, processed: 0 },
    { id: ProcessStatIds.EXCEPTIONS, label: 'Exceptions', target: 0, processed: 0, exceptions: [] }
  ]
}

export const getProcessedStats = (stats: ProcessStatRow[], response: BulkProcessResponse): ProcessStatRow[] => {
  return stats.map(stat => {
    const responseData = response[stat.id]

    if (stat.id === ProcessStatIds.EXCEPTIONS) {
      return {
        ...stat,
        processed: (responseData as string[])?.length,
        exceptions: responseData as string[]
      }
    }

    return {
      ...stat,
      processed: responseData as number
    }
  })
}

const BulkProcessStatusModal = ({
  isOpen,
  onClose,
  title = 'Process Summary',
  isProcessing = false,
  stats
}: BulkProcessStatusModalProps) => {
  const getBackgroundColor = (row: ProcessStatRow) => {
    if (!isProcessing) {
      if (row.target === row.processed) {
        return '#e1ffaf'
      } else {
        return '#ffd0be'
      }
    }
  }

  const exceptions = stats?.find(stat => stat.exceptions)?.exceptions ?? []

  console.log(exceptions, stats)

  return (
    <ChaarvyModal title={title} isOpen={isOpen} onClose={onClose}>
      <Box sx={{ p: 4, minWidth: 350 }}>
        {/* Table Headers */}
        <Grid container spacing={2} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
          {['Action', 'Target', 'Processed'].map(each => (
            <Grid item xs={4}>
              <Typography variant='subtitle2' color='text.secondary'>
                {each}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Dynamic Data Rows */}
        {stats.map(row => (
          <Grid container spacing={2} key={row.id} sx={{ mb: 1.5, alignItems: 'center' }}>
            <Grid item xs={4}>
              <Typography variant='body2' fontWeight={500}>
                {row.label}
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ backgroundColor: getBackgroundColor(row) }}>
              <Typography variant='body2'>{row.target}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ backgroundColor: getBackgroundColor(row) }}>
              <ChaarvyFlex className={{ alignItems: 'center', gap: 1 }}>
                <Typography variant='body2'>{row.processed}</Typography>

                {/* Show a micro-spinner next to the row if it's currently processing and incomplete */}
                {isProcessing && row.processed < row.target && <CircularProgress size={12} thickness={5} />}
              </ChaarvyFlex>
            </Grid>
          </Grid>
        ))}

        {/* Global Processing Indicator */}
        {isProcessing && (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={24} />
            <Typography variant='body2' color='text.secondary'>
              Please wait, processing data...
            </Typography>
          </Box>
        )}

        {exceptions?.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant='subtitle2' color='error'>
              Exceptions:
            </Typography>
            {exceptions.map((exception, index) => (
              <Typography key={index} variant='body2' color='error'>
                - {exception}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </ChaarvyModal>
  )
}

export default BulkProcessStatusModal
