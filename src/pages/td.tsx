import { ReactNode } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'

import DesignerPage from '../views/TemplateDesigner/DesignerPage'

const TemplateDesigner = () => {
  return <DesignerPage />
}

TemplateDesigner.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
export default TemplateDesigner
