import React, { useCallback, useState, useMemo } from 'react'

import { LoadingSpinner } from 'src/reusable_components'
import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'
import { useGetCashflowDetailsQuery } from 'src/store/services/dashboardServices'

type FinanceFilters = {
  startDate: string
  endDate: string
  unit: 'week' | 'month' | 'year'
}

const FinancePage: React.FC = () => {
  const [props, setProps] = useState<FinanceFilters>(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Formatting directly as 'YYYY-MM-DD' for native date inputs
    const format = (d: Date) => d.toISOString().split('T')[0]

    return {
      startDate: format(startOfMonth),
      endDate: format(endOfMonth),
      unit: 'month'
    }
  })

  // Fixed updater: Removed 'normalizeDateInput' which was likely locking the year.
  // The chart now controls exact date strings reliably.
  const handleRequestChange = useCallback((newFilters: FinanceFilters) => {
    setProps(prev => {
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

  const { data: cashflowData, isFetching: isLoadingCashflow } = useGetCashflowDetailsQuery(props)

  const chartSeriesConfig = useMemo(
    () => [
      {
        name: 'Payments Accepted',
        color: '#2e7d32',
        matchRecord: (r: any) => r.type === 'payment',
        getValue: (r: any) => r.amount
      },
      {
        name: 'Expenses',
        color: '#d32f2f',
        matchRecord: (r: any) => r.type === 'expense',
        getValue: (r: any) => r.amount
      }
    ],
    []
  )

  const renderTooltip = ({ category, seriesData }: any) => {
    if (!seriesData || seriesData.length === 0) return ''

    const metricRows = seriesData
      .map((s: any) => {
        const displayValue = (s.value ?? 0).toLocaleString('en-IN')

        return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 11px; color: ${s.color}; text-transform: uppercase; font-weight: 700; margin-right: 16px;">
          ${s.seriesName}
        </span>
        <strong style="font-size: 14px; color: #333;">
          ₹${displayValue}
        </strong>
      </div>
    `
      })
      .join('')

    return `
    <div style="padding: 12px; font-family: inherit; min-width: 200px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 6px; background: #fff; border: 1px solid #eaeaea;">
      <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f0f0f0;">
        <span style="font-size: 12px; color: #757575; font-weight: 600;">${category}</span>
      </div>
      <div>${metricRows}</div>
    </div>
  `
  }

  if (isLoadingCashflow) {
    return <LoadingSpinner />
  }

  return (
    <TimelineDashboard<any>
      records={cashflowData ?? []}
      getDate={record => record.date}
      seriesConfig={chartSeriesConfig}
      startDate={props.startDate} // Prop drilled explicitly
      endDate={props.endDate} // Prop drilled explicitly
      frequency={props.unit} // Prop drilled explicitly
      valueFormatter={val => `₹${(val ?? 0).toLocaleString('en-IN')}`}
      tooltipFormatter={renderTooltip}
      onRequestChange={handleRequestChange}
    />
  )
}

export default FinancePage
