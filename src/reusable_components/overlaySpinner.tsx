import React, { CSSProperties, useState } from 'react'
import { CircleLoader } from 'react-spinners'

const override: CSSProperties = {
  display: 'block',
  margin: '0 auto',
  borderColor: 'red'
}

const OverlaySpinner = () => {
  const [loading, setLoading] = useState(true)
  const [color, setColor] = useState('#743ccf')

  return (
    <div
      style={{ zIndex: 1050 }}
      className='position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50'
    >
      <CircleLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={100}
        aria-label='Loading Spinner'
        data-testid='loader'
      />
    </div>
  )
}

export default OverlaySpinner
