import React from 'react'

import { Box, Typography } from '@muiElements'
import { Card1 } from 'src/components/Cards/dashboardCards'
import CurrentTransportationStatus from 'src/views/Transportation/Dashboard/CurrentTransportationStatus'

const Transportation = () => {
  return (
    <>
      <Typography variant='h4' sx={{ mb: 4 }}>
        Dashboard - Transportation
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Card1
          variant='detailInfo'
          isLoading={true}
          cardTitle='Vechicles in Operation'
          cardValue={4}
          details={[
            { key: 'Completed', value: 120 },
            { key: 'Pending', value: 30 }
          ]}

          // backgroundImage='https://images.pexels.com/photos/32322674/pexels-photo-32322674.jpeg'
        />
        <Card1
          variant='detailInfo'
          isLoading={false}
          cardTitle='Drivers'
          cardValue={12}
          details={[
            { key: 'Active', value: 10 },
            { key: 'Inactive', value: 2 },
            { key: 'On Leave', value: 1 },
            { key: 'Contractual', value: 1 }
          ]}

          // backgroundImage={`linear-gradient(to top, ${pink[50]}, ${blue[50]})`}

          // backgroundImage='https://images.pexels.com/photos/32322674/pexels-photo-32322674.jpeg'
        />
        <Card1
          cardTitle='Vendors'
          isLoading={false}
          variant='detailInfo'
          cardValue={5}
          details={[
            { key: 'Active', value: 4 },
            { key: 'Inactive', value: 1 }
          ]}

          // backgroundImage='https://images.pexels.com/photos/32322674/pexels-photo-32322674.jpeg'
        />

        <Card1
          variant='chart'
          cardTitle='Passengers'
          isLoading={false}
          values={[70, 30, 10]}
          labels={['Paid', 'Close to Due', 'Overdue']}
        />
        <CurrentTransportationStatus />
      </Box>
    </>
  )
}

export default Transportation
