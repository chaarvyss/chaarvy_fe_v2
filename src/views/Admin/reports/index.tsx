import { LoadingButton } from '@mui/lab'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme
} from '@mui/material'
import React, { useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useDownloadBooksTemplateMutation, useDownloadStudentsTemplateMutation } from 'src/store/services/bulkServices'
import { useStudentAdmissionsReportMutation } from 'src/store/services/reportServices'
import { downloadDocument } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'

type DownloadActionType =
  | 'student_clean'
  | 'student_old'
  | 'book_clean'
  | 'book_old'
  | 'report_admissions'
  | 'report_dropouts'
  | null

const Reports = () => {
  const theme = useTheme()
  const { triggerToast } = useToast()

  const [activeDownload, setActiveDownload] = useState<DownloadActionType>(null)

  // Service mutations
  const [getStudentAdmissions] = useStudentAdmissionsReportMutation()
  const [downloadStudentsTemplate] = useDownloadStudentsTemplateMutation()
  const [downloadBooksTemplate] = useDownloadBooksTemplateMutation()

  // Standard Reports
  const handleDownloadReport = async (status?: string, actionType: DownloadActionType = null) => {
    setActiveDownload(actionType)
    try {
      const blob = await getStudentAdmissions(status).unwrap()
      const url = window.URL.createObjectURL(blob)
      const fileName = status === '0' ? 'Dropouts_Report' : 'Student_Admissions_Report'
      downloadDocument(url, fileName)
      triggerToast('Report downloaded successfully', { variant: ToastVariants.SUCCESS })
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Failed to download report', { variant: ToastVariants.ERROR })
    } finally {
      setActiveDownload(null)
    }
  }

  // Student Template Download
  const handleDownloadStudentTemplate = async (includeOld: boolean, actionType: DownloadActionType) => {
    setActiveDownload(actionType)
    try {
      const blob = await downloadStudentsTemplate({ include_old: includeOld }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const fileName = includeOld ? 'student_onboarding_mass_update.xlsx' : 'student_onboarding_clean.xlsx'
      downloadDocument(url, fileName)
      triggerToast(
        includeOld ? 'Active students & fees export downloaded' : 'Clean student onboarding template downloaded',
        { variant: ToastVariants.SUCCESS }
      )
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Failed to download template', { variant: ToastVariants.ERROR })
    } finally {
      setActiveDownload(null)
    }
  }

  // Books Template Download
  const handleDownloadBooksTemplate = async (includeOld: boolean, actionType: DownloadActionType) => {
    setActiveDownload(actionType)
    try {
      const blob = await downloadBooksTemplate({ include_old: includeOld }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const fileName = includeOld ? 'books_inventory_mass_update.xlsx' : 'books_inventory_clean.xlsx'
      downloadDocument(url, fileName)
      triggerToast(includeOld ? 'Active books & mappings export downloaded' : 'Clean books template downloaded', {
        variant: ToastVariants.SUCCESS
      })
    } catch (err: any) {
      triggerToast(err?.data?.detail || 'Failed to download template', { variant: ToastVariants.ERROR })
    } finally {
      setActiveDownload(null)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Section 1: Standard Admission Reports */}
      <Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' fontWeight={600}>
            Admission & Student Reports
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Generate and export comprehensive reports for active admissions and dropouts.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Active Admissions Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              variant='outlined'
              sx={{
                p: 2,
                borderRadius: 2,
                borderColor: theme.palette.divider,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  variant='rounded'
                  sx={{
                    bgcolor: `${theme.palette.primary.main}18`,
                    color: theme.palette.primary.main,
                    width: 44,
                    height: 44
                  }}
                >
                  <GetChaarvyIcons iconName='AccountSchoolOutline' fontSize='1.5rem' />
                </Avatar>
                <Box>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Student Admissions
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Complete enrolled student records
                  </Typography>
                </Box>
              </Box>

              <LoadingButton
                fullWidth
                variant='outlined'
                color='primary'
                loading={activeDownload === 'report_admissions'}
                onClick={() => handleDownloadReport(undefined, 'report_admissions')}
                startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Download Report
              </LoadingButton>
            </Card>
          </Grid>

          {/* Dropouts Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              variant='outlined'
              sx={{
                p: 2,
                borderRadius: 2,
                borderColor: theme.palette.divider,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  boxShadow: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  variant='rounded'
                  sx={{
                    bgcolor: `${theme.palette.error.main}18`,
                    color: theme.palette.error.main,
                    width: 44,
                    height: 44
                  }}
                >
                  <GetChaarvyIcons iconName='AccountOffOutline' fontSize='1.5rem' />
                </Avatar>
                <Box>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Dropouts
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Students marked as dropped out
                  </Typography>
                </Box>
              </Box>

              <LoadingButton
                fullWidth
                variant='outlined'
                color='error'
                loading={activeDownload === 'report_dropouts'}
                onClick={() => handleDownloadReport('0', 'report_dropouts')}
                startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Download Report
              </LoadingButton>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Section 2: Bulk Upload & Onboarding Templates */}
      <Box>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant='h6' fontWeight={600}>
            Bulk Upload & Onboarding Templates
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Download clean Excel templates for new entries or export existing active records for mass editing and
            updates.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Card 1: Student Onboarding Workbook */}
          <Grid item xs={12} md={6}>
            <Card
              variant='outlined'
              sx={{
                borderRadius: 2,
                borderColor: theme.palette.divider,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: `${theme.palette.success.main}18`,
                      color: theme.palette.success.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <GetChaarvyIcons iconName='FileExcel' fontSize='1.75rem' />
                  </Avatar>
                }
                title={
                  <Typography variant='subtitle1' fontWeight={600}>
                    Student Onboarding Template
                  </Typography>
                }
                subheader={
                  <Typography variant='caption' color='text.secondary'>
                    Multi-sheet workbook (Students, Course_Fees, Addon_Courses, Total_Fees)
                  </Typography>
                }
              />

              <CardContent sx={{ pt: 0 }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
                  Self-validating Excel workbook with automated capacity checks, fee calculations, and add-on course
                  linkages.
                </Typography>

                <Stack spacing={2}>
                  {/* Clean Template Option */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2' fontWeight={600}>
                          Clean Template
                        </Typography>
                        <Chip label='New Admissions' size='small' color='primary' variant='outlined' />
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        Zero sample data. Blank sheets ready for fresh admissions.
                      </Typography>
                    </Box>

                    <LoadingButton
                      variant='contained'
                      size='small'
                      color='primary'
                      loading={activeDownload === 'student_clean'}
                      onClick={() => handleDownloadStudentTemplate(false, 'student_clean')}
                      startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
                      sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
                    >
                      Download (.xlsx)
                    </LoadingButton>
                  </Box>

                  {/* Mass Update Option */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2' fontWeight={600}>
                          Active Data Export
                        </Typography>
                        <Chip label='Mass Update' size='small' color='info' variant='outlined' />
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        Pre-populated with all current active students & fee structures for mass editing.
                      </Typography>
                    </Box>

                    <LoadingButton
                      variant='outlined'
                      size='small'
                      color='info'
                      loading={activeDownload === 'student_old'}
                      onClick={() => handleDownloadStudentTemplate(true, 'student_old')}
                      startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
                      sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
                    >
                      Export Data (.xlsx)
                    </LoadingButton>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Books Inventory & Curriculum Workbook */}
          <Grid item xs={12} md={6}>
            <Card
              variant='outlined'
              sx={{
                borderRadius: 2,
                borderColor: theme.palette.divider,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    variant='rounded'
                    sx={{
                      bgcolor: `${theme.palette.warning.main}18`,
                      color: theme.palette.warning.main,
                      width: 48,
                      height: 48
                    }}
                  >
                    <GetChaarvyIcons iconName='Bookshelf' fontSize='1.75rem' />
                  </Avatar>
                }
                title={
                  <Typography variant='subtitle1' fontWeight={600}>
                    Books & Curriculum Template
                  </Typography>
                }
                subheader={
                  <Typography variant='caption' color='text.secondary'>
                    Two-sheet architecture (Books_Master & Book_Mappings)
                  </Typography>
                }
              />

              <CardContent sx={{ pt: 0 }}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
                  Sheet 1 manages physical catalog & available stock. Sheet 2 manages curriculum program mappings with
                  pre-linked formulas.
                </Typography>

                <Stack spacing={2}>
                  {/* Clean Template Option */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2' fontWeight={600}>
                          Clean Template
                        </Typography>
                        <Chip label='New Catalog' size='small' color='warning' variant='outlined' />
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        Blank stock catalog with auto-linking formulas for curriculum mappings.
                      </Typography>
                    </Box>

                    <LoadingButton
                      variant='contained'
                      size='small'
                      color='warning'
                      loading={activeDownload === 'book_clean'}
                      onClick={() => handleDownloadBooksTemplate(false, 'book_clean')}
                      startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
                      sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
                    >
                      Download (.xlsx)
                    </LoadingButton>
                  </Box>

                  {/* Mass Update Option */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2' fontWeight={600}>
                          Active Data Export
                        </Typography>
                        <Chip label='Mass Update' size='small' color='info' variant='outlined' />
                      </Box>
                      <Typography variant='caption' color='text.secondary'>
                        Pre-populated with all current active books, stock, and program curriculum assignments.
                      </Typography>
                    </Box>

                    <LoadingButton
                      variant='outlined'
                      size='small'
                      color='info'
                      loading={activeDownload === 'book_old'}
                      onClick={() => handleDownloadBooksTemplate(true, 'book_old')}
                      startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
                      sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
                    >
                      Export Data (.xlsx)
                    </LoadingButton>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Reports
