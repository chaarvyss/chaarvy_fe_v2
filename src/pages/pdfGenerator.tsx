import React from 'react'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import PDFGenerator from 'src/reusable_components/pdfGenerator'

const PDFGeneratorPage = () => {
  return <PDFGenerator />
}

PDFGeneratorPage.getLayout = (page: React.ReactElement) => <BlankLayout>{page}</BlankLayout>

export default PDFGeneratorPage
