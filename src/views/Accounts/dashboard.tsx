import React from 'react'

import { PermissionLabels } from 'src/constants/permissions'
import { GridDashboard, LayoutCard } from 'src/reusable_components/GridDashboard'
import FinancePage from '../dashboardCards/FinancialStatus'
import OverallExpensesDashboardCard from '../dashboardCards/OverallExpenses'

const dashboardComponents = {
  CashFlow: FinancePage,
  Expenses: OverallExpensesDashboardCard
}

const dashboardLayout: LayoutCard[] = [
  {
    i: 'CashFlow',
    x: 0,
    y: 0,
    w: 8,
    h: 2,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.cashFlow,
    hadSearch: false
  },
  {
    i: 'Expenses',
    x: 0,
    y: 0,
    w: 4,
    h: 3,
    shouldHide: false,
    permission_key: PermissionLabels.dashboard.expenses,
    hadSearch: false
  }
]

const AccountsDashboard: React.FC = () => {
  return (
    <GridDashboard
      storageKey='/accounts-dashboard' // Unique string for local storage isolation
      defaultLayout={dashboardLayout}
      componentsMap={dashboardComponents}
    />
  )
}

export default AccountsDashboard
