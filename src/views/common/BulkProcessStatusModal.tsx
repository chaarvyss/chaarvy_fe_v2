import { Box, Grid, Typography, CircularProgress } from '@mui/material'
import React from 'react'

import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'

export interface ProcessStatRow {
  id: string
  label: string
  target: number
  processed: number
}

export interface BulkProcessStatusModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  isProcessing?: boolean
  stats: ProcessStatRow[]
}

const BulkProcessStatusModal = ({
  isOpen,
  onClose,
  title = 'Process Summary',
  isProcessing = false,
  stats
}: BulkProcessStatusModalProps) => {
  return (
    <ChaarvyModal title={title} isOpen={isOpen} onClose={onClose}>
      <Box sx={{ p: 4, minWidth: 350 }}>
        {/* Table Headers */}
        <Grid container spacing={2} sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
          <Grid item xs={4}>
            <Typography variant='subtitle2' color='text.secondary'>
              Action
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant='subtitle2' color='text.secondary'>
              Target
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant='subtitle2' color='text.secondary'>
              Processed
            </Typography>
          </Grid>
        </Grid>

        {/* Dynamic Data Rows */}
        {stats.map(row => (
          <Grid container spacing={2} key={row.id} sx={{ mb: 1.5, alignItems: 'center' }}>
            <Grid item xs={4}>
              <Typography variant='body2' fontWeight={500}>
                {row.label}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant='body2'>{row.target}</Typography>
            </Grid>
            <Grid item xs={4}>
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
      </Box>
    </ChaarvyModal>
  )
}

export default BulkProcessStatusModal
