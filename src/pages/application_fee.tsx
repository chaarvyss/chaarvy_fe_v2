import { useState, useEffect } from 'react'
import { useCheckPaymentStatusQuery } from 'src/store/services/feesServices'

export default function PaymentPage() {
  const [paymentId, setPaymentId] = useState(null)
  const [paymentLink, setPaymentLink] = useState(null)

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const queryParams = new URLSearchParams(window.location.search)
  //     setApplication(queryParams.get('id') ?? undefined)
  //   }
  // }, [])

  // http://localhost:3000/application_fees?razorpay_payment_id=pay_Q9sODwLdmj8uNe&razorpay_payment_link_id=plink_Q9sN5FaIHhwh01&razorpay_payment_link_reference_id=&razorpay_payment_link_status=paid&razorpay_signature=c194901bdb354a5028056edc19f39613bde6df9993131a2f810cd74fea55811b

  const { data: paymentStatus, refetch } = useCheckPaymentStatusQuery(paymentId, {
    skip: !paymentId, // Skip the query if there's no paymentId
    pollingInterval: 5000 // Auto-check status every 5 seconds
  })

  useEffect(() => {
    if (paymentStatus?.status === 'paid') {
      alert('Payment successful!')
    } else if (paymentStatus?.status === 'failed' || paymentStatus?.status === 'expired') {
      alert('Payment failed or expired.')
    }
  }, [paymentStatus])

  return (
    <div className='container text-center mt-5'>
      <h2>Pay with Razorpay</h2>
      {/* <button onClick={handleCreatePayment} className='btn btn-primary' disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Create Payment Link'}
      </button> */}

      {paymentLink && (
        <>
          <p className='mt-3'>Click below to pay:</p>
          <a href={paymentLink} target='_blank' className='btn btn-success'>
            Proceed to Payment
          </a>
        </>
      )}

      {paymentId && (
        <div className='mt-3'>
          <button onClick={refetch} className='btn btn-info'>
            Check Payment Status
          </button>
        </div>
      )}

      {paymentStatus && (
        <p className='mt-3'>
          Payment Status: <strong>{paymentStatus.status}</strong>
        </p>
      )}
    </div>
  )
}
