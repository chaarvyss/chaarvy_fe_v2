import { LoadingButton } from '@mui/lab'
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material'
import React, { useRef, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import {
  useDownloadStudentsErrorSheetMutation,
  useDownloadStudentsTemplateMutation,
  useUploadStudentsMutation,
  useValidateStudentsMutation
} from 'src/store/services/bulkServices'
import { StudentValidationResponse, UploadMode } from 'src/store/types/bulk'
import { downloadDocument } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'

interface StudentBulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const StudentBulkUploadModal = ({ isOpen, onClose, onSuccess }: StudentBulkUploadModalProps) => {
  const theme = useTheme()
  const { triggerToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // API Mutations
  const [downloadTemplate, { isLoading: isDownloadingTemplate }] = useDownloadStudentsTemplateMutation()
  const [validateStudents, { isLoading: isValidating }] = useValidateStudentsMutation()
  const [uploadStudents, { isLoading: isUploading }] = useUploadStudentsMutation()
  const [downloadErrorSheet, { isLoading: isDownloadingErrorSheet }] = useDownloadStudentsErrorSheetMutation()

  // State
  const [includeOld, setIncludeOld] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<StudentValidationResponse | null>(null)
  const [uploadMode, setUploadMode] = useState<UploadMode>('skip_errors')
  const [showPreviewTable, setShowPreviewTable] = useState<boolean>(false)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)

  // Reset modal state
  const handleClose = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setUploadMode('skip_errors')
    setShowPreviewTable(false)
    setIsDragOver(false)
    onClose()
  }

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate({ include_old: includeOld }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const fileName = includeOld ? 'student_onboarding_mass_update.xlsx' : 'student_onboarding_template.xlsx'
      downloadDocument(url, fileName)
      triggerToast('Template downloaded successfully', { variant: ToastVariants.SUCCESS })
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Failed to download template', { variant: ToastVariants.ERROR })
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

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await validateStudents(formData).unwrap()
      setValidationResult(res)
      if (res.error_count === 0) {
        triggerToast(`Validation passed! ${res.valid_count} valid student(s) found.`, {
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
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const blob = await downloadErrorSheet(formData).unwrap()
      const url = window.URL.createObjectURL(blob)
      downloadDocument(url, 'student_errors_to_fix.xlsx')
      triggerToast('Error spreadsheet downloaded', { variant: ToastVariants.SUCCESS })
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Failed to download error sheet', { variant: ToastVariants.ERROR })
    }
  }

  // Confirm and upload
  const handleConfirmUpload = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await uploadStudents({ formData, mode: uploadMode }).unwrap()
      triggerToast(res.message || 'Students imported successfully!', { variant: ToastVariants.SUCCESS })
      onSuccess?.()
      handleClose()
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Upload failed. Please try again.', { variant: ToastVariants.ERROR })
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
    <ChaarvyModal
      isOpen={isOpen}
      onClose={handleClose}
      title='Bulk Upload Students & Fees'
      modalSize='col-12 col-md-9 col-lg-8'
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
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
                  Download the self-validating multi-sheet Excel workbook.
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
              Dry-run validation in progress, checking capacities and fee formulas...
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
                Step 3: Validation Results & Financial Breakdown
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

            {/* Financial Summary Cards */}
            {validationResult.summary && (
              <Card
                variant='outlined'
                sx={{
                  borderRadius: 2,
                  borderColor: `${theme.palette.primary.main}40`,
                  backgroundColor: `${theme.palette.primary.main}06`
                }}
              >
                <CardContent sx={{ p: '14px !important' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Course Fees
                      </Typography>
                      <Typography variant='subtitle2' fontWeight={600} color='text.primary'>
                        ₹{validationResult.summary.total_course_fees.toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Addon Fees ({validationResult.summary.total_addon_enrollments} enrolled)
                      </Typography>
                      <Typography variant='subtitle2' fontWeight={600} color='text.primary'>
                        ₹{validationResult.summary.total_addon_fees.toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Books Fees
                      </Typography>
                      <Typography variant='subtitle2' fontWeight={600} color='text.primary'>
                        ₹{validationResult.summary.total_books_fees.toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant='caption' color='primary' fontWeight={600} display='block'>
                        Grand Total Payable
                      </Typography>
                      <Typography variant='subtitle1' fontWeight={700} color='primary.main'>
                        ₹{validationResult.summary.total_payable_fees.toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

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
                <Box sx={{ maxHeight: 120, overflowY: 'auto', mt: 1 }}>
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

            {/* Valid Rows Preview Toggle */}
            {validationResult.valid_rows_preview && validationResult.valid_rows_preview.length > 0 && (
              <Box>
                <Box
                  onClick={() => setShowPreviewTable(!showPreviewTable)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <Typography variant='caption' fontWeight={600} color='primary.main'>
                    {showPreviewTable ? 'Hide' : 'Show'} Preview of Valid Rows ({validationResult.valid_count})
                  </Typography>
                  <GetChaarvyIcons
                    iconName={showPreviewTable ? 'ChevronUp' : 'ChevronDown'}
                    fontSize='1.25rem'
                    color={theme.palette.primary.main}
                  />
                </Box>

                <Collapse in={showPreviewTable}>
                  <TableContainer component={Card} variant='outlined' sx={{ maxHeight: 200, mt: 1, borderRadius: 1.5 }}>
                    <Table size='small' stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Adm No</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Course Fees</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Addons</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Payable</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {validationResult.valid_rows_preview.map(row => (
                          <TableRow key={row.row_number}>
                            <TableCell>{row.row_number}</TableCell>
                            <TableCell>{row.admission_number}</TableCell>
                            <TableCell>{row.student_name}</TableCell>
                            <TableCell>₹{row.total_course_fees.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              {row.addon_courses?.length > 0 ? row.addon_courses.join(', ') : 'None'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>₹{row.payable_fees.toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Box>
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
            {validationResult ? `Confirm & Import (${validationResult.valid_count} Students)` : 'Confirm & Import'}
          </LoadingButton>
        </ChaarvyFlex>
      </Box>
    </ChaarvyModal>
  )
}

export default StudentBulkUploadModal
