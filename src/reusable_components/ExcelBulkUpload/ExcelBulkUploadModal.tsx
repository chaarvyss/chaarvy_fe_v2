import { LoadingButton } from '@mui/lab'
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
  useTheme
} from '@mui/material'
import React, { useRef, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { BaseValidationResponse, UploadMode } from 'src/store/types/bulk'
import { downloadDocument } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'

export interface ExcelBulkUploadModalProps<T extends BaseValidationResponse> {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title: string
  entityName: string
  templateFileNamePrefix: string
  modalSize?: string
  guidanceAlert?: React.ReactNode
  renderCustomSummary?: (validationResult: T) => React.ReactNode
  onDownloadTemplate: (includeOld: boolean) => Promise<Blob>
  onValidate: (file: File) => Promise<T>
  onUpload: (file: File, mode: UploadMode) => Promise<{ message?: string }>
  onDownloadErrorSheet: (file: File) => Promise<Blob>
}

export function ExcelBulkUploadModal<T extends BaseValidationResponse>({
  isOpen,
  onClose,
  onSuccess,
  title,
  entityName,
  templateFileNamePrefix,
  modalSize = 'col-12 col-md-9 col-lg-8',
  guidanceAlert,
  renderCustomSummary,
  onDownloadTemplate,
  onValidate,
  onUpload,
  onDownloadErrorSheet
}: ExcelBulkUploadModalProps<T>) {
  const theme = useTheme()
  const { triggerToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // States
  const [includeOld, setIncludeOld] = useState<boolean>(false)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [validationResult, setValidationResult] = useState<T | null>(null)
  const [uploadMode, setUploadMode] = useState<UploadMode>('skip_errors')
  const [isDownloadingErrorSheet, setIsDownloadingErrorSheet] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)

  // Reset modal state on close
  const handleClose = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setUploadMode('skip_errors')
    setIsDragOver(false)
    onClose()
  }

  // Handle template download
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true)
    try {
      const blob = await onDownloadTemplate(includeOld)
      const url = window.URL.createObjectURL(blob)
      const fileName = includeOld
        ? `${templateFileNamePrefix}_mass_update.xlsx`
        : `${templateFileNamePrefix}_template.xlsx`
      downloadDocument(url, fileName)
      triggerToast('Template downloaded successfully', { variant: ToastVariants.SUCCESS })
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Failed to download template', { variant: ToastVariants.ERROR })
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  // Process selected file & trigger pre-validation
  const processFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      triggerToast('Please upload a valid Excel (.xlsx) file', { variant: ToastVariants.INFO })

      return
    }
    setSelectedFile(file)
    setValidationResult(null)
    setIsValidating(true)

    try {
      const res = await onValidate(file)
      setValidationResult(res)
      if (res.error_count === 0) {
        triggerToast(`Validation passed! ${res.valid_count} valid ${entityName.toLowerCase()} found.`, {
          variant: ToastVariants.SUCCESS
        })
      } else {
        triggerToast(`Validation completed with ${res.error_count} error(s). Review details below.`, {
          variant: ToastVariants.INFO
        })
      }
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Validation failed. Please check the file structure.', {
        variant: ToastVariants.ERROR
      })
    } finally {
      setIsValidating(false)
    }
  }

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  // Download error spreadsheet
  const handleDownloadErrorSheet = async () => {
    if (!selectedFile) return
    setIsDownloadingErrorSheet(true)
    try {
      const blob = await onDownloadErrorSheet(selectedFile)
      const url = window.URL.createObjectURL(blob)
      downloadDocument(url, `${templateFileNamePrefix}_errors_to_fix.xlsx`)
      triggerToast('Error spreadsheet downloaded', { variant: ToastVariants.SUCCESS })
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Failed to download error sheet', { variant: ToastVariants.ERROR })
    } finally {
      setIsDownloadingErrorSheet(false)
    }
  }

  // Confirm and upload
  const handleConfirmUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const res = await onUpload(selectedFile, uploadMode)
      triggerToast(res?.message || `${entityName} imported successfully!`, { variant: ToastVariants.SUCCESS })
      onSuccess?.()
      handleClose()
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Upload failed. Please try again.', { variant: ToastVariants.ERROR })
    } finally {
      setIsUploading(false)
    }
  }

  // Check if import button is disabled
  const isImportDisabled =
    !validationResult ||
    validationResult.valid_count === 0 ||
    isValidating ||
    isUploading ||
    (uploadMode === 'all_or_nothing' && validationResult.error_count > 0)

  return (
    <ChaarvyModal isOpen={isOpen} onClose={handleClose} title={title} modalSize={modalSize}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
        {/* Optional Guidance Alert */}
        {guidanceAlert}

        {/* Step 1: Template Download Section */}
        <Card
          variant='outlined'
          sx={{
            borderColor: theme.palette.divider,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: '16px !important' }}>
            <ChaarvyFlex
              className={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
            >
              <Box>
                <Typography variant='subtitle1' fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GetChaarvyIcons
                    iconName='FileDownloadOutline'
                    fontSize='1.25rem'
                    color={theme.palette.primary.main}
                  />
                  Step 1: Download Template
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Download the Excel template for {entityName.toLowerCase()}.
                </Typography>
              </Box>

              <ChaarvyFlex className={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeOld}
                      onChange={e => setIncludeOld(e.target.checked)}
                      size='small'
                      color='primary'
                    />
                  }
                  label={
                    <Typography variant='caption' fontWeight={500}>
                      Include active records (for update)
                    </Typography>
                  }
                />

                <LoadingButton
                  variant='outlined'
                  size='small'
                  loading={isDownloadingTemplate}
                  onClick={handleDownloadTemplate}
                  startIcon={<GetChaarvyIcons iconName='FileExcel' fontSize='1.25rem' />}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  Download Template (.xlsx)
                </LoadingButton>
              </ChaarvyFlex>
            </ChaarvyFlex>
          </CardContent>
        </Card>

        {/* Step 2: Upload Spreadsheet Drag & Drop */}
        <Box>
          <Typography
            variant='subtitle1'
            fontWeight={600}
            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <GetChaarvyIcons iconName='CloudUploadOutline' fontSize='1.25rem' color={theme.palette.primary.main} />
            Step 2: Select or Drop Completed Spreadsheet
          </Typography>

          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragOver
                ? `${theme.palette.primary.main}12`
                : theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.01)'
                  : 'rgba(0,0,0,0.01)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: `${theme.palette.primary.main}08`
              }
            }}
          >
            <input
              type='file'
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept='.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              onChange={handleFileChange}
            />

            <GetChaarvyIcons
              iconName={selectedFile ? 'FileCheckOutline' : 'CloudUpload'}
              fontSize='2.5rem'
              color={selectedFile ? theme.palette.success.main : theme.palette.text.secondary}
            />

            {selectedFile ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant='subtitle2' fontWeight={600} color='success.main'>
                  {selectedFile.name}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {(selectedFile.size / 1024).toFixed(1)} KB — Click or drop another file to replace
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 1 }}>
                <Typography variant='body2' fontWeight={500}>
                  Click to browse or drag and drop your completed .xlsx file here
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Validates automatically upon selection
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Validation Loading Indicator */}
        {isValidating && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 2 }}>
            <LoadingButton loading variant='text'>
              Validating spreadsheet...
            </LoadingButton>
            <Typography variant='body2' color='text.secondary'>
              Dry-run validation in progress, checking records and constraints...
            </Typography>
          </Box>
        )}

        {/* Step 3: Pre-Validation Preview */}
        {validationResult && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
            >
              <Typography variant='subtitle1' fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GetChaarvyIcons iconName='CheckCircleOutline' fontSize='1.25rem' color={theme.palette.success.main} />
                Step 3: Validation Results
              </Typography>

              {/* Status Chips */}
              <Stack direction='row' spacing={1}>
                <Chip
                  label={`Total Rows: ${validationResult.total_rows}`}
                  size='small'
                  variant='outlined'
                  sx={{ fontWeight: 500 }}
                />
                <Chip
                  label={`Valid: ${validationResult.valid_count}`}
                  size='small'
                  color='success'
                  sx={{ fontWeight: 600 }}
                />
                {validationResult.error_count > 0 && (
                  <Chip
                    label={`Errors: ${validationResult.error_count}`}
                    size='small'
                    color='error'
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
            </Box>

            {/* Custom Domain Summary Slot (e.g. Student Fees & Valid Row Preview) */}
            {renderCustomSummary && renderCustomSummary(validationResult)}

            {/* Invalid Rows / Errors Alert */}
            {validationResult.error_count > 0 && (
              <Alert
                severity='error'
                variant='outlined'
                sx={{ borderRadius: 2 }}
                action={
                  <LoadingButton
                    size='small'
                    color='error'
                    variant='contained'
                    loading={isDownloadingErrorSheet}
                    onClick={handleDownloadErrorSheet}
                    startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
                    sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                  >
                    Download Error Sheet to Fix
                  </LoadingButton>
                }
              >
                <AlertTitle sx={{ fontWeight: 600 }}>
                  {validationResult.error_count} Row(s) with Errors Found
                </AlertTitle>
                <Box sx={{ maxHeight: 130, overflowY: 'auto', mt: 1 }}>
                  {validationResult.invalid_rows.slice(0, 5).map((row, idx) => (
                    <Typography key={idx} variant='caption' display='block' sx={{ mb: 0.5 }}>
                      • <strong>Row {row.row_number}</strong> {row.sheet ? `(${row.sheet})` : ''}:{' '}
                      {row.errors.join(' | ')}
                    </Typography>
                  ))}
                  {validationResult.invalid_rows.length > 5 && (
                    <Typography variant='caption' color='text.secondary' fontStyle='italic'>
                      ...and {validationResult.invalid_rows.length - 5} more error rows. Download the error spreadsheet
                      to review all.
                    </Typography>
                  )}
                </Box>
              </Alert>
            )}

            {/* Step 4: Upload Mode Selection */}
            <Box sx={{ pt: 1 }}>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                Upload Mode:
              </Typography>
              <RadioGroup row value={uploadMode} onChange={e => setUploadMode(e.target.value as UploadMode)}>
                <FormControlLabel
                  value='skip_errors'
                  control={<Radio size='small' color='primary' />}
                  label={
                    <Box>
                      <Typography variant='body2' fontWeight={500}>
                        Skip errors and import valid rows (Recommended)
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Imports the {validationResult.valid_count} valid record(s) and skips errored rows.
                      </Typography>
                    </Box>
                  }
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  value='all_or_nothing'
                  control={<Radio size='small' color='primary' />}
                  label={
                    <Box>
                      <Typography variant='body2' fontWeight={500}>
                        All-or-nothing
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Rejects the entire upload if even 1 error is detected.
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>

              {uploadMode === 'all_or_nothing' && validationResult.error_count > 0 && (
                <Typography variant='caption' color='error.main' sx={{ mt: 0.5, display: 'block' }}>
                  Cannot import in All-or-nothing mode while errors are present. Fix the errors in the spreadsheet or
                  switch to Skip Errors.
                </Typography>
              )}
            </Box>
          </Box>
        )}

        <Divider />

        {/* Footer Actions */}
        <ChaarvyFlex className={{ justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          <ChaarvyButton
            variant='outlined'
            color='secondary'
            size='small'
            onClick={handleClose}
            disabled={isUploading}
            label='Cancel'
          />

          <LoadingButton
            variant='contained'
            color='primary'
            size='small'
            loading={isUploading}
            disabled={isImportDisabled}
            onClick={handleConfirmUpload}
            startIcon={<GetChaarvyIcons iconName='Check' fontSize='1.25rem' />}
            sx={{ textTransform: 'none', px: 3, borderRadius: 1.5 }}
          >
            {validationResult ? `Confirm & Import (${validationResult.valid_count} ${entityName})` : 'Confirm & Import'}
          </LoadingButton>
        </ChaarvyFlex>
      </Box>
    </ChaarvyModal>
  )
}

export default ExcelBulkUploadModal
