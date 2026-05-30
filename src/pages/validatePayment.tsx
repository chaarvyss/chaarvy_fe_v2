import { useEffect } from 'react'

const ValidatePayment = () => {
  useEffect(() => {
    let payment_key_id
    let razorpay_payment_link_status
    let transaction_id
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search)
      payment_key_id = queryParams.get('id')
      razorpay_payment_link_status = queryParams.get('razorpay_payment_link_status')
      transaction_id = queryParams.get('razorpay_payment_id')
    }
    if (payment_key_id) {
      console.log('Payment Key ID:', { payment_key_id, razorpay_payment_link_status, transaction_id })
    }

    // if (razorpay_payment_link_status == 'paid') {
    //   updateApplicationPayment({ application_id: payment_key_id, segment_id, transaction_id })
    //     .unwrap()
    //     .then(() => {
    //       const url = window.location.origin + window.location.pathname
    //       window.history.replaceState({}, document.title, url)
    //       handleNext(AdmissionFormType.STUDENT_DETAIL)
    //     })
    // }
  }, [])

  return <div>ValidatePayment</div>
}

export default ValidatePayment
