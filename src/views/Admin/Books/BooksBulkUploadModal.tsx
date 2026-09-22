import { Alert, AlertTitle, Typography, useTheme } from '@mui/material'
import React from 'react'

import { ExcelBulkUploadModal } from 'src/reusable_components'
import {
  useDownloadBooksErrorSheetMutation,
  useDownloadBooksTemplateMutation,
  useUploadBooksMutation,
  useValidateBooksMutation
} from 'src/store/services/bulkServices'
import { BooksValidationResponse } from 'src/store/types/bulk'
import GetChaarvyIcons from 'src/utils/icons'

interface BooksBulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const BooksBulkUploadModal = ({ isOpen, onClose, onSuccess }: BooksBulkUploadModalProps) => {
  const theme = useTheme()

  // API Mutations
  const [downloadTemplate] = useDownloadBooksTemplateMutation()
  const [validateBooks] = useValidateBooksMutation()
  const [uploadBooks] = useUploadBooksMutation()
  const [downloadErrorSheet] = useDownloadBooksErrorSheetMutation()

  const booksGuidanceAlert = (
    <Alert
      severity='info'
      variant='outlined'
      icon={<GetChaarvyIcons iconName='InformationOutline' fontSize='1.25rem' />}
      sx={{
        borderRadius: 2,
        borderColor: `${theme.palette.info.main}50`,
        backgroundColor: `${theme.palette.info.main}08`
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
        Two-Sheet Books & Curriculum Architecture
      </AlertTitle>
      <Typography variant='caption' display='block' sx={{ mb: 0.5 }}>
        • <strong>Sheet 1 (Books_Master)</strong>: Physical stock catalog (Book Name, Medium, Price, Available Qty).
        Each book exists once per medium.
      </Typography>
      <Typography variant='caption' display='block'>
        • <strong>Sheet 2 (Book_Mappings)</strong>: Curriculum assignments (Program(s), Segment(s), Is Common). Book
        names are auto-linked from Sheet 1. Supports comma-separated programs (e.g. <code>MPC, BiPC</code> with{' '}
        <code>Is Common = Yes</code>) or <code>All Programs</code>.
      </Typography>
    </Alert>
  )

  return (
    <ExcelBulkUploadModal<BooksValidationResponse>
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      title='Bulk Upload Books & Curriculum'
      entityName='Books'
      templateFileNamePrefix='books_inventory'
      guidanceAlert={booksGuidanceAlert}
      onDownloadTemplate={includeOld => downloadTemplate({ include_old: includeOld }).unwrap()}
      onValidate={file => {
        const formData = new FormData()
        formData.append('file', file)

        return validateBooks(formData).unwrap()
      }}
      onUpload={(file, mode) => {
        const formData = new FormData()
        formData.append('file', file)

        return uploadBooks({ formData, mode }).unwrap()
      }}
      onDownloadErrorSheet={file => {
        const formData = new FormData()
        formData.append('file', file)

        return downloadErrorSheet(formData).unwrap()
      }}
    />
  )
}

export default BooksBulkUploadModal
