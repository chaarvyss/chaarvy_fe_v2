import React, { useCallback, useMemo, useState } from 'react'

import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'
import { normalizeDateInput } from 'src/utils/helpers'

// import { useGetCollectionsQuery } from 'src/store/services/dashboardServices' // <-- Import your API hook here

interface FeeCollection {
  id: string
  amount: number
  date: string // ISO string
}

type CollectionFilters = {
  startDate: string
  endDate: string
  unit: 'week' | 'month' | 'year'
}

// Transform your static data into the record format required for navigation
const mockFeeRecords: FeeCollection[] = [
  { id: '1', amount: 1200, date: '2026-06-28T09:00:00Z' }, // Today
  { id: '2', amount: 2800, date: '2026-06-28T13:00:00Z' },
  { id: '3', amount: 4200, date: '2026-06-28T17:00:00Z' },
  { id: '4', amount: 15000, date: '2026-06-22T09:00:00Z' }, // This Week
  { id: '5', amount: 14000, date: '2026-06-24T09:00:00Z' },
  { id: '6', amount: 28000, date: '2026-06-26T09:00:00Z' }
]

const CollectionsDashboardCard: React.FC = () => {
  // 1. Initialize State (Defaulting to current year/month based on your preference)
  const [filters, setFilters] = useState<CollectionFilters>(() => {
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
  const handleRequestChange: React.Dispatch<React.SetStateAction<CollectionFilters>> = useCallback(updater => {
    setFilters(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const referenceYear = new Date().getFullYear()

      const normalizedNext: CollectionFilters = {
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

  // 3. API Hook Setup (Uncomment and replace mockFeeRecords when ready)
  // const { data: apiCollections, isFetching } = useGetCollectionsQuery(filters)
  const isFetching = false
  const activeRecords = mockFeeRecords // Swap this to `apiCollections ?? []` when using the API

  // 4. Memoize the Series Config to prevent infinite re-renders in the chart
  const chartSeriesConfig = useMemo(
    () => [
      {
        name: 'Collections',
        color: '#2e7d32', // Green
        matchRecord: () => true, // All records in this set are collections
        getValue: (r: FeeCollection) => r.amount
      }
    ],
    []
  )

  // 5. Custom Tooltip (Upgraded to prevent flickering/shivering)
  const renderTooltip = ({ seriesData, category }: any) => {
    const total = seriesData[0]?.value ?? 0

    return `
      <div style="padding: 12px; font-family: inherit; width: 160px; pointer-events: none; border-radius: 6px; background: #fff; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; color: #757575; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">
          ${category}
        </div>
        <div style="font-size: 18px; font-weight: bold; color: #2e7d32;">
          ₹${total.toLocaleString('en-IN')}
        </div>
      </div>
    `
  }

  if (isFetching) {
    return <div>Loading...</div>
  }

  return (
    <TimelineDashboard<FeeCollection>
      records={activeRecords}
      getDate={record => record.date}
      seriesConfig={chartSeriesConfig}
      valueFormatter={val => `₹${(val ?? 0).toLocaleString('en-IN')}`}
      tooltipFormatter={renderTooltip}
      onRequestChange={handleRequestChange}
      startDate={filters.startDate}
      endDate={filters.endDate}
      frequency={filters.unit}
    />
  )
}

export default CollectionsDashboardCard
