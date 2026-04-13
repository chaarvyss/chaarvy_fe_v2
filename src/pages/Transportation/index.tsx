import React from 'react'

import { Box, Typography } from '@muiElements'
import { Card1, DashboardTable } from 'src/components/Cards/dashboardCards'
import { ChaarvyTableColumn } from 'src/reusable_components/ChaarvyDataTable'

const Transportation = () => {
  const columns: ChaarvyTableColumn[] = [
    {
      id: 's_no',
      label: 'S.No',
      hideable: true,
      defaultHidden: false,
      width: 40,
      render: (row, index) => index + 1
    },
    {
      id: 'route',
      label: 'Route',
      hideable: true,
      defaultHidden: true
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      hideable: true
    },

    {
      id: 'students_onboard',
      label: 'Students Onboard',
      hideable: true,
      width: 170
    },
    {
      id: 'current_location',
      label: 'Current Location',
      hideable: true
    }
  ]

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
        <DashboardTable
          cardTitle='Current Transportation Status'
          columns={columns}
          data={[
            {
              id: 1,
              route: 'Route A',
              vehicle: 'Bus 101',
              students_onboard: 30,
              current_location: 'Downtown'
            },
            {
              id: 2,
              route: 'Route B',
              vehicle: 'Van 202',
              students_onboard: 15,
              current_location: 'Uptown'
            },
            {
              id: 3,
              route: 'Route C',
              vehicle: 'Bus 303',
              students_onboard: 25,
              current_location: 'Midtown'
            }
          ]}
          getRowKey={row => row.id}
          onRowClick={row => alert(`Row clicked: ${row.route}`)}
          emptyMessage='No Transportation Data Available'
        />
      </Box>
    </>
  )
}

export default Transportation
