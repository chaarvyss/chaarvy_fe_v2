import { Stack } from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'

import { LoadingSpinner } from 'src/reusable_components'
import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'
import { useGetExpensesQuery } from 'src/store/services/dashboardServices'

type ExpenseFilters = {
  startDate: string
  endDate: string
  unit: 'week' | 'month' | 'year'
}

// Ensure you have ExpenseRecord imported or defined here!
// import { ExpenseRecord } from 'src/types...'

const OverallExpensesDashboardCard: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFilters>(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Formatting directly as 'YYYY-MM-DD' for native/library date inputs
    const format = (d: Date) => d.toISOString().split('T')[0]

    return {
      startDate: format(startOfMonth),
      endDate: format(endOfMonth),
      unit: 'month'
    }
  })

  // 2. Fixed Request Change: Removed the 'normalizeDateInput' year trap
  const handleRequestChange = useCallback((newFilters: ExpenseFilters) => {
    setFilters(prev => {
      if (
        newFilters.startDate === prev.startDate &&
        newFilters.endDate === prev.endDate &&
        newFilters.unit === prev.unit
      ) {
        return prev
      }

      return newFilters
    })
  }, [])

  // 3. API Hook Setup
  const { data: apiExpenses, isFetching } = useGetExpensesQuery(filters)

  const activeRecords = apiExpenses ?? []

  // 4. Memoize the Series Config to prevent infinite re-renders
  const chartSeriesConfig = useMemo(
    () => [
      {
        name: 'Expenses',
        color: '#f55252',
        matchRecord: () => true, // Match all records for overall expenses
        getValue: (r: any) => r.amount // Replace 'any' with 'ExpenseRecord' if typed properly
      }
    ],
    []
  )

  const renderBreakdownTooltip = ({
    category,
    seriesData,
    records
  }: {
    category: string
    seriesData: { seriesName: string; value: number; color: string }[]
    records: any[] // Replace 'any' with 'ExpenseRecord'
  }) => {
    if (!records || records.length === 0) return ''

    const catAggs: Record<string, number> = {}
    const benAggs: Record<string, number> = {}

    records.forEach(r => {
      catAggs[r.category] = (catAggs[r.category] || 0) + r.amount
      benAggs[r.beneficiaryType] = (benAggs[r.beneficiaryType] || 0) + r.amount
    })

    const totalValue = seriesData.reduce((sum, s) => sum + (s.value ?? 0), 0)

    return `
  <div style="padding: 12px; font-family: inherit; width: 240px; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 6px; background: #fff; border: 1px solid #eaeaea;">
    <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
      <span style="font-size: 12px; color: #757575; font-weight: 600;">${category}</span><br/>
      <strong style="font-size: 16px; color: #333;">Total: ₹${totalValue.toLocaleString('en-IN')}</strong>
    </div>
  </div>
`
  }

  if (isFetching) {
    return <LoadingSpinner />
  }

  return (
    <Stack direction='column' spacing={2} sx={{ height: '100%' }} justifyContent='end'>
      <TimelineDashboard<any> // Swap <any> to <ExpenseRecord> if you have the type
        records={activeRecords}
        getDate={record => record.date_of_payment}
        seriesConfig={chartSeriesConfig}
        startDate={filters.startDate}
        endDate={filters.endDate}
        frequency={filters.unit}
        valueFormatter={val => `₹${(val ?? 0).toLocaleString('en-IN')}`}
        tooltipFormatter={renderBreakdownTooltip}
        onRequestChange={handleRequestChange}
      />
    </Stack>
  )
}

export default OverallExpensesDashboardCard
