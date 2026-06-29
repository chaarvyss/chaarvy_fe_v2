import React, { useCallback, useState, useMemo } from 'react'

import { LoadingSpinner } from 'src/reusable_components'
import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'
import { useGetCashflowDetailsQuery } from 'src/store/services/dashboardServices'
import { normalizeDateInput } from 'src/utils/helpers'

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

    return {
      startDate: normalizeDateInput(startOfMonth, '', today.getFullYear()),
      endDate: normalizeDateInput(endOfMonth, '', today.getFullYear()),
      unit: 'month' as 'week' | 'month' | 'year'
    }
  })

  const handleRequestChange: React.Dispatch<React.SetStateAction<FinanceFilters>> = useCallback(updater => {
    setProps(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const referenceYear = new Date().getFullYear()
      const normalizedNext: FinanceFilters = {
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

  const { data: cashflowData, isFetching: isLoadingCashflow } = useGetCashflowDetailsQuery(props)

  // NEW: Memoizing this prevents React from thinking the config changes on every render.
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
      valueFormatter={val => `₹${(val ?? 0).toLocaleString('en-IN')}`}
      tooltipFormatter={renderTooltip}
      onRequestChange={handleRequestChange}
      initialFrequency='month' // Ensure it starts exactly as the FinanceFilters state does above
    />
  )
}

export default FinancePage
