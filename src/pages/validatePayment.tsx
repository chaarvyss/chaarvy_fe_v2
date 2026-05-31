import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Typography } from '@muiElements'
import { useToast, ToastVariants } from 'src/@core/context/toastContext'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import LoadingSpinner from 'src/reusable_components/LoadingSpinner'
import { useUpdateProcessingFeesStatusMutation } from 'src/store/services/feesServices'

const ValidatePayment = () => {
  const router = useRouter()
  const pathname = usePathname()

  const { triggerToast } = useToast()

  const [updateProcessingFeesStatus] = useUpdateProcessingFeesStatusMutation()

  useEffect(() => {
    let payment_key_id
    let razorpay_payment_link_status
    let transaction_id
    let is_bulk
    let student_id
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      payment_key_id = queryParams.get('id')
      student_id = queryParams.get('student_id')
      razorpay_payment_link_status = queryParams.get('razorpay_payment_link_status')
      transaction_id = queryParams.get('razorpay_payment_id')
      is_bulk = queryParams.get('is_bulk')
    }
    router.replace(pathname)
    if (payment_key_id) {
      updateProcessingFeesStatus({
        payment_id: payment_key_id,
        transaction_number: transaction_id || '',
        transaction_status: razorpay_payment_link_status === 'paid' ? 1 : 0
      })
        .unwrap()
        .then(() => {
          if (is_bulk === 'true') {
            router.push('/StudentManagement/Admissions')
          } else {
            router.push(`/AdmissionForm?id=${student_id}&step=2`)
          }
        })
        .catch(e => {
          triggerToast(e, {
            variant: ToastVariants.ERROR
          })
        })
    }
  }, [])

  return (
    <ChaarvyFlex
      className={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <>
        <LoadingSpinner />
        <Typography variant='h6' align='center'>
          Validating Payment...
        </Typography>
      </>
    </ChaarvyFlex>
  )
}

export default ValidatePayment
