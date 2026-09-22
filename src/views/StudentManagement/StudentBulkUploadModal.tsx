import {
  Box,
  Card,
  CardContent,
  Collapse,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'

import { ExcelBulkUploadModal } from 'src/reusable_components'
import {
  useDownloadStudentsErrorSheetMutation,
  useDownloadStudentsTemplateMutation,
  useUploadStudentsMutation,
  useValidateStudentsMutation
} from 'src/store/services/bulkServices'
import { StudentValidationResponse } from 'src/store/types/bulk'
import GetChaarvyIcons from 'src/utils/icons'

interface StudentBulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const StudentBulkUploadModal = ({ isOpen, onClose, onSuccess }: StudentBulkUploadModalProps) => {
  const theme = useTheme()
  const [showPreviewTable, setShowPreviewTable] = useState<boolean>(false)

  // API Mutations
  const [downloadTemplate] = useDownloadStudentsTemplateMutation()
  const [validateStudents] = useValidateStudentsMutation()
  const [uploadStudents] = useUploadStudentsMutation()
  const [downloadErrorSheet] = useDownloadStudentsErrorSheetMutation()

  const renderStudentFinancialSummary = (validationResult: StudentValidationResponse) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
    </Box>
  )

  return (
    <ExcelBulkUploadModal<StudentValidationResponse>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title='Bulk Upload Students & Fees'
      entityName='Students'
      templateFileNamePrefix='student_onboarding'
      onDownloadTemplate={includeOld => downloadTemplate({ include_old: includeOld }).unwrap()}
      onValidate={file => {
        const formData = new FormData()
        formData.append('file', file)

        return validateStudents(formData).unwrap()
      }}
      onUpload={(file, mode) => {
        const formData = new FormData()
        formData.append('file', file)

        return uploadStudents({ formData, mode }).unwrap()
      }}
      onDownloadErrorSheet={file => {
        const formData = new FormData()
        formData.append('file', file)

        return downloadErrorSheet(formData).unwrap()
      }}
      renderCustomSummary={renderStudentFinancialSummary}
    />
  )
}

export default StudentBulkUploadModal
