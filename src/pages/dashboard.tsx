import React from 'react'

import { PermissionLabels } from 'src/constants/permissions'
import { GridDashboard, LayoutCard } from 'src/reusable_components/GridDashboard'
import Attendence from 'src/views/dashboardCards/attendence'
import MyCalendar from 'src/views/dashboardCards/calendar'
import FinancePage from 'src/views/dashboardCards/FinancialStatus'
import OverallExpensesDashboardCard from 'src/views/dashboardCards/OverallExpenses'
import Payments from 'src/views/dashboardCards/payments'
import Population from 'src/views/dashboardCards/population'
import StationaryStock from 'src/views/dashboardCards/stationaryStock'
import StudentEnrollmentChart from 'src/views/dashboardCards/studentsByCourse'
import DashboardTodoList from 'src/views/dashboardCards/Todo'

const dashboardComponents = {
  Calender: MyCalendar,
  Students: Population,
  Attendence: Attendence,
  Payments: Payments,
  Stationary_stock: StationaryStock,
  Student_enrollments: StudentEnrollmentChart,
  CashFlow: FinancePage,
  Expenses: OverallExpensesDashboardCard,
  Todo: DashboardTodoList
}

const dashboardLayout: LayoutCard[] = [
  { i: 'greetingCard', x: 0, y: 0, w: 8, h: 2, shouldHide: true, permission_key: '', hadSearch: false },
  {
    i: 'Todo',
    x: 0,
    y: 0,
    w: 8,
    h: 2,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.todo,
    hadSearch: false
  },

  {
    i: 'Students',
    x: 0,
    y: 0,
    w: 4,
    h: 3,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.studentCount,
    hadSearch: false
  },
  { i: 'Attendence', x: 4, y: 0, w: 4, h: 3, shouldHide: true, permission_key: '', hadSearch: false },
  { i: 'Calender', x: 8, y: 0, w: 4, h: 4, shouldHide: true, permission_key: '', hadSearch: false },
  {
    i: 'Payments',
    x: 0,
    y: 3,
    w: 6,
    h: 2,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.payments,
    hadSearch: false
  },
  {
    i: 'Stationary_stock',
    x: 6,
    y: 3,
    w: 6,
    h: 3,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.stationaryStock,
    hadSearch: false
  },
  {
    i: 'Student_enrollments',
    x: 0,
    y: 6,
    w: 12,
    h: 4,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.studentEnrollments,
    hadSearch: false
  },
  {
    i: 'CashFlow',
    x: 0,
    y: 10,
    w: 6,
    h: 4,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.cashFlow,
    hadSearch: false
  },
  {
    i: 'Expenses',
    x: 6,
    y: 10,
    w: 6,
    h: 4,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.expenses,
    hadSearch: false
  }
]

const ClientDashboard: React.FC = () => {
  return (
    <GridDashboard
      storageKey='/client-dashboard' // Unique string for local storage isolation
      defaultLayout={dashboardLayout}
      componentsMap={dashboardComponents}
    />
  )
}

export default ClientDashboard
