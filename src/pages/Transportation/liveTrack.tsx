import dynamic from 'next/dynamic'
import { useState } from 'react'

import { Box } from '@muiElements'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import GetChaarvyIcons from 'src/utils/icons'

// Dynamically import the Map component to prevent SSR errors
const MultiVehicleTracker = dynamic(() => import('../../@core/components/Transportation/MultiVehicleTracker'), {
  ssr: false,
  loading: () => <p>Loading Live Map...</p>
})

const fleetData = {
  V101: {
    route: [
      [83.2185, 17.6868],
      [83.225, 17.69],
      [83.235, 17.7]
    ],
    stops: [
      { id: 1, lng: 83.2185, lat: 17.6868, time: '08:00 AM' },
      { id: 2, lng: 83.235, lat: 17.7, time: '08:15 AM' }
    ]
  },
  V102: {
    route: [
      [83.29, 17.71],
      [83.3, 17.72],
      [83.31, 17.73]
    ],
    stops: [{ id: 3, lng: 83.29, lat: 17.71, time: '08:30 AM' }]
  }
}

const LiveTrackingPage = () => {
  const activeBusIds = ['V101', 'V102']

  const [shouldShowMap, setShouldShowMap] = useState(false)

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h4>Live Status</h4>
        <Box alignItems='center' justifyContent='space-between' display='flex' gap={4}>
          <p>Active Vehicles: {activeBusIds.length}</p>
          <ChaarvyButton variant='outlined' size='small' onClick={() => setShouldShowMap(prev => !prev)}>
            <GetChaarvyIcons iconName='Map' />
            {shouldShowMap ? ' Hide Map' : ' Show Map'}
          </ChaarvyButton>
        </Box>

        <div style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden' }}>
          {shouldShowMap && <MultiVehicleTracker vehicleIds={activeBusIds} fleetData={fleetData} />}
        </div>
      </div>
    </div>
  )
}

export default LiveTrackingPage
