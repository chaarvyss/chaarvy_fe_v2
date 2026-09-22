import { LoadingButton } from '@mui/lab'
import { Avatar, Box, Card, Divider, Grid, Typography, useTheme } from '@mui/material'
import { useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { TemplateDownloadCard } from 'src/reusable_components'
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
            <TemplateDownloadCard
              title='Student Onboarding Template'
              subheader='Multi-sheet workbook (Students, Course_Fees, Addon_Courses, Total_Fees)'
              description='Self-validating Excel workbook with automated capacity checks, fee calculations, and add-on course linkages.'
              iconName='FileExcel'
              iconBgColor={`${theme.palette.success.main}18`}
              iconColor={theme.palette.success.main}
              cleanChipLabel='New Admissions'
              cleanDescription='Zero sample data. Blank sheets ready for fresh admissions.'
              cleanButtonColor='primary'
              isCleanLoading={activeDownload === 'student_clean'}
              onDownloadClean={() => handleDownloadStudentTemplate(false, 'student_clean')}
              exportChipLabel='Mass Update'
              exportDescription='Pre-populated with all current active students & fee structures for mass editing.'
              exportButtonColor='info'
              isExportLoading={activeDownload === 'student_old'}
              onDownloadExport={() => handleDownloadStudentTemplate(true, 'student_old')}
            />
          </Grid>

          {/* Card 2: Books Inventory & Curriculum Workbook */}
          <Grid item xs={12} md={6}>
            <TemplateDownloadCard
              title='Books & Curriculum Template'
              subheader='Two-sheet architecture (Books_Master & Book_Mappings)'
              description='Sheet 1 manages physical catalog & available stock. Sheet 2 manages curriculum program mappings with pre-linked formulas.'
              iconName='Bookshelf'
              iconBgColor={`${theme.palette.warning.main}18`}
              iconColor={theme.palette.warning.main}
              cleanChipLabel='New Catalog'
              cleanDescription='Blank stock catalog with auto-linking formulas for curriculum mappings.'
              cleanButtonColor='warning'
              isCleanLoading={activeDownload === 'book_clean'}
              onDownloadClean={() => handleDownloadBooksTemplate(false, 'book_clean')}
              exportChipLabel='Mass Update'
              exportDescription='Pre-populated with all current active books, stock, and program curriculum assignments.'
              exportButtonColor='info'
              isExportLoading={activeDownload === 'book_old'}
              onDownloadExport={() => handleDownloadBooksTemplate(true, 'book_old')}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Reports
