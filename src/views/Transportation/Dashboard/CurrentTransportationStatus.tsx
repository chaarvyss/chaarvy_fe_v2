import { useState } from 'react'

import { Typography } from '@muiElements'
import { DashboardTable } from 'src/components/Cards/dashboardCards'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'

import RouteDetailsModal from './Modals/RouteDetailsModal'
import StudentsListViewModal from './Modals/StudentsListViewModal'
import VehicleDetailsModal from './Modals/VehicleDetailsModal'

const CurrentTransportationStatus = () => {
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false)
  const [isRouteDetailsModalOpen, setIsRouteDetailsModalOpen] = useState(false)
  const [isStudentsListViewModalOpen, setIsStudentsListViewModalOpen] = useState(false)

  const [selectedDetails, setSelectedDetails] = useState({
    route: '',
    vehicle: '',
    students_onboard: 0,
    current_location: ''
  })

  const handleCellClick = (row: any, columnId: string) => {
    setSelectedDetails(row)
    if (columnId === 'vehicle') {
      setIsVehicleDetailsModalOpen(true)
    }
    if (columnId === 'route') {
      setIsRouteDetailsModalOpen(true)
    }
    if (columnId === 'students_onboard') {
      setIsStudentsListViewModalOpen(true)
    }
  }

  const columns: ChaarvyTableColumn[] = [
    {
      id: 's_no',
      label: 'S.No',
      hideable: true,
      defaultHidden: false,
      width: 40,
      render: (row, index) => <Typography variant='body2'>{index + 1}</Typography>
    },
    {
      id: 'route',
      label: 'Route',
      hideable: true,
      defaultHidden: false,
      render: row => (
        <Typography onClick={() => handleCellClick(row, 'route')} variant='body2'>
          {row.route}
        </Typography>
      )
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      hideable: true,
      render: row => (
        <Typography onClick={() => handleCellClick(row, 'vehicle')} variant='body2'>
          {row.vehicle}
        </Typography>
      )
    },

    {
      id: 'students_onboard',
      label: 'Students Onboard',
      hideable: true,
      width: 170,
      render: row => (
        <Typography onClick={() => handleCellClick(row, 'students_onboard')} variant='body2'>
          {row.students_onboard}
        </Typography>
      )
    },
    {
      id: 'current_location',
      label: 'Current Location',
      hideable: true,
      render: row => (
        <Typography onClick={() => handleCellClick(row, 'current_location')} variant='body2'>
          {row.current_location}
        </Typography>
      )
    }
  ]

  return (
    <>
      <DashboardTable
        cardTitle='Current Transportation Status'
        columns={columns}
        data={[
          {
            id: 1,
            route: 'Route A',
            vehicle: 'Bus 101',
            students_onboard: '30/30',
            current_location: 'Downtown'
          },
          {
            id: 2,
            route: 'Route B',
            vehicle: 'Van 202',
            students_onboard: '15/20',
            current_location: 'Uptown'
          },
          {
            id: 3,
            route: 'Route C',
            vehicle: 'Bus 303',
            students_onboard: '25/30',
            current_location: 'Midtown'
          }
        ]}
        getRowKey={row => row.id}
        emptyMessage='No Transportation Data Available'
      />

      <VehicleDetailsModal
        isOpen={isVehicleDetailsModalOpen}
        onClose={() => setIsVehicleDetailsModalOpen(false)}
        vehicleId={selectedDetails.vehicle}
      />

      <RouteDetailsModal
        isOpen={isRouteDetailsModalOpen}
        onClose={() => setIsRouteDetailsModalOpen(false)}
        routeId={selectedDetails.route}
      />

      <StudentsListViewModal
        isOpen={isStudentsListViewModalOpen}
        onClose={() => setIsStudentsListViewModalOpen(false)}
        routeId={selectedDetails.route}
      />
    </>
  )
}

export default CurrentTransportationStatus
