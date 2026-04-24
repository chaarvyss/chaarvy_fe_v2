import { ReactNode } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import ErrorPage from 'src/views/pages/ErrorPage'

export default function Custom401() {
  return <ErrorPage error={401} />
}

Custom401.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
