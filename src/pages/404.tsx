import { ReactNode } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import ErrorPage from 'src/views/pages/ErrorPage'

export default function Custom404() {
  return <ErrorPage error={404} />
}

Custom404.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
