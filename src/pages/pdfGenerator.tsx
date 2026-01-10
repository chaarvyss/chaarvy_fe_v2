import React from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import { generateAndDownloadPDF } from 'src/reusable_components/generateAndDownloadPDF'
import sampleData from 'src/utils/simple_test - data.json'
import template from 'src/utils/simple_test.json'

const PDFGeneratorPage = () => {
  const donwloadpdf = () => {
    generateAndDownloadPDF(template, sampleData)
  }

  return (
    <div>
      <button onClick={donwloadpdf}>Download PDF</button>
    </div>
  )
}

PDFGeneratorPage.getLayout = (page: React.ReactElement) => <BlankLayout>{page}</BlankLayout>

export default PDFGeneratorPage
