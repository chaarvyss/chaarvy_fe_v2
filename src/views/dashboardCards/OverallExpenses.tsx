import React, { useCallback, useMemo, useState } from 'react'

import { LoadingSpinner } from 'src/reusable_components'
import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'
import { useGetExpensesQuery } from 'src/store/services/dashboardServices' // <-- Import your API hook here
import { normalizeDateInput } from 'src/utils/helpers'

type ExpenseFilters = {
  startDate: string
  endDate: string
  unit: 'week' | 'month' | 'year'
}

const OverallExpensesDashboardCard: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFilters>(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: normalizeDateInput(startOfMonth, '', today.getFullYear()),
      endDate: normalizeDateInput(endOfMonth, '', today.getFullYear()),
      unit: 'month' as 'week' | 'month' | 'year'
    }
  })

  // 2. Handle Request Changes from TimelineDashboard
  const handleRequestChange: React.Dispatch<React.SetStateAction<ExpenseFilters>> = useCallback(updater => {
    setFilters(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const referenceYear = new Date().getFullYear()

      const normalizedNext: ExpenseFilters = {
        ...next,
        startDate: normalizeDateInput(next.startDate, prev.startDate, referenceYear),
        endDate: normalizeDateInput(next.endDate, prev.endDate, referenceYear)
      }

      if (
        normalizedNext.startDate === prev.startDate &&
        normalizedNext.endDate === prev.endDate &&
        normalizedNext.unit === prev.unit
      ) {
        return prev
      }

      return normalizedNext
    })
  }, [])

  // 3. API Hook Setup (Uncomment and replace mockExpenses when ready)
  const { data: apiExpenses, isFetching } = useGetExpensesQuery(filters)

  const activeRecords = apiExpenses ?? [] // Swap this to `apiExpenses ?? []` when using the API

  // 4. Memoize the Series Config to prevent infinite re-renders
  const chartSeriesConfig = useMemo(
    () => [
      {
        name: 'Expenses',
        color: '#f55252',
        matchRecord: () => true, // Match all records for overall expenses
        getValue: (r: ExpenseRecord) => r.amount
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
    records: ExpenseRecord[]
  }) => {
    if (!records || records.length === 0) return ''

    const catAggs: Record<string, number> = {}
    const benAggs: Record<string, number> = {}

    records.forEach(r => {
      catAggs[r.category] = (catAggs[r.category] || 0) + r.amount
      benAggs[r.beneficiaryType] = (benAggs[r.beneficiaryType] || 0) + r.amount
    })

    // NEW: Smart row builder that sorts by amount and limits the rows
    const buildRows = (aggs: Record<string, number>, maxRows = 4) => {
      // Sort descending (highest amounts first)
      const sorted = Object.entries(aggs).sort((a, b) => b[1] - a[1])

      const topItems = sorted.slice(0, maxRows)
      const remainingItems = sorted.slice(maxRows)

      let html = topItems
        .map(
          ([name, amt]) => `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                           <span style="color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;" title="${name}">${name}:</span> 
                           <strong style="margin-left: 12px;">₹${amt.toLocaleString('en-IN')}</strong>
                         </div>`
        )
        .join('')

      // If there is overflow, bundle it beautifully into an "Other" row
      if (remainingItems.length > 0) {
        const remainingTotal = remainingItems.reduce((sum, [, amt]) => sum + amt, 0)
        html += `<div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #ddd;">
                 <span style="color: #888; font-style: italic; font-size: 11px;">Other (${remainingItems.length} more):</span> 
                 <strong style="margin-left: 12px; color: #888;">₹${remainingTotal.toLocaleString('en-IN')}</strong>
               </div>`
      }

      return html
    }

    const totalValue = seriesData.reduce((sum, s) => sum + (s.value ?? 0), 0)

    return `
  <div style="padding: 12px; font-family: inherit; width: 240px; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 6px; background: #fff; border: 1px solid #eaeaea;">
    <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
      <span style="font-size: 12px; color: #757575; font-weight: 600;">${category}</span><br/>
      <strong style="font-size: 16px; color: #333;">Total: ₹${totalValue.toLocaleString('en-IN')}</strong>
    </div>
    
    <div style="margin-bottom: 12px;">
       <div style="font-size: 10px; font-weight: bold; letter-spacing: 0.5px; color: #9e9e9e; margin-bottom: 6px;">TOP CATEGORIES</div>
       <div style="font-size: 13px;">${buildRows(catAggs, 3)}</div>
    </div>

    <div>
       <div style="font-size: 10px; font-weight: bold; letter-spacing: 0.5px; color: #9e9e9e; margin-bottom: 6px;">TOP BENEFICIARIES</div>
       <div style="font-size: 13px;">${buildRows(benAggs, 3)}</div>
    </div>
  </div>
`
  }

  if (isFetching) {
    return <LoadingSpinner />
  }

  return (
    <TimelineDashboard<ExpenseRecord>
      records={activeRecords}
      getDate={record => record.date_of_payment}
      seriesConfig={chartSeriesConfig}
      valueFormatter={val => `₹${(val ?? 0).toLocaleString('en-IN')}`}
      tooltipFormatter={renderBreakdownTooltip}
      onRequestChange={handleRequestChange}
      initialFrequency={filters.unit} // Ensures the chart starts on the same view as the initial state
    />
  )
}

export default OverallExpensesDashboardCard
