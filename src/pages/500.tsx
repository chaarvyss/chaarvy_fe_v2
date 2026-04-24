import { ReactNode } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import ErrorPage from 'src/views/pages/ErrorPage'

export default function Custom500() {
  return <ErrorPage error={500} />
}

Custom500.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
