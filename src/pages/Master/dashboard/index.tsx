import React from 'react'

import { GridDashboard, LayoutCard } from 'src/reusable_components/GridDashboard'

import ActiveClients from '../../../views/dashboardCards/ActiveClients'
import ClientsList from '../../../views/dashboardCards/clientsList'
import CollectionsDashboard from '../../../views/dashboardCards/collections'
import DropClients from '../../../views/dashboardCards/DropClients'
import DashboardTodoList from './Todo'

const dashboardComponents = {
  Clients: ClientsList,
  'Active clients': ActiveClients,
  'Droped clients': DropClients,
  Collections: CollectionsDashboard,
  Todo: DashboardTodoList
}

const dashboardLayout: LayoutCard[] = [
  {
    i: 'Active clients',
    x: 0,
    y: 0,
    w: 4,
    h: 3,
    shouldHide: false,
    hadSearch: false,
    permission_key: 'a07d2d6e-8431-4527-9857-c7d155715002'
  },
  {
    i: 'Droped clients',
    x: 4,
    y: 0,
    w: 4,
    h: 3,
    shouldHide: false,
    hadSearch: false,
    permission_key: 'a07d2d6e-8431-4527-9857-c7d155715002'
  },
  {
    i: 'Todo',
    x: 8,
    y: 0,
    w: 4,
    h: 7,
    shouldHide: false,
    hadSearch: false,
    permission_key: 'a07d2d6e-8431-4527-9857-c7d155715002'
  },
  {
    i: 'Collections',
    x: 0,
    y: 3,
    w: 8,
    h: 4,
    shouldHide: false,
    hadSearch: false,
    permission_key: 'a07d2d6e-8431-4527-9857-c7d155715002'
  },
  {
    i: 'Clients',
    x: 0,
    y: 8,
    w: 12,
    h: 4,
    shouldHide: false,
    hadSearch: true,
    permission_key: 'a07d2d6e-8431-4527-9857-c7d155715002'
  }
]

const MasterDashboard: React.FC = () => {
  return (
    <GridDashboard
      storageKey='/master-dashboard' // Unique string for local storage isolation
      defaultLayout={dashboardLayout}
      componentsMap={dashboardComponents}
    />
  )
}

export default MasterDashboard
