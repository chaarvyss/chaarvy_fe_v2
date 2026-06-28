import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'

interface FeeCollection {
  id: string
  amount: number
  date: string // ISO string
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

const CollectionsDashboardCard = () => {
  return (
    <TimelineDashboard<FeeCollection>
      title='Fee Collections'
      records={mockFeeRecords}
      getDate={record => record.date}
      seriesConfig={[
        {
          name: 'Collections',
          color: '#2e7d32', // Green
          matchRecord: () => true, // All records in this set are collections
          getValue: r => r.amount
        }
      ]}
      valueFormatter={val => `₹${val.toLocaleString('en-IN')}`}
      // Custom tooltip for single-series (Collections only)
      tooltipFormatter={({ seriesData, category }) => {
        const total = seriesData[0]?.value ?? 0
        return `
          <div style="padding: 12px; font-family: sans-serif; min-width: 160px; border-radius: 6px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-size: 11px; color: #757575; text-transform: uppercase;">${category}</div>
            <div style="font-size: 16px; font-weight: bold; color: #2e7d32;">
              ₹${total.toLocaleString('en-IN')}
            </div>
          </div>
        `
      }}
    />
  )
}

export default CollectionsDashboardCard
