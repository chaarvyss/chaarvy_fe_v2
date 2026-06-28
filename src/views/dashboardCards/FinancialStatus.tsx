import React from 'react'
import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'
import { TooltipParams } from 'src/reusable_components/Charts/TimelineAreaChart/TimelineChart'

// Your specific data type
interface FinancialRecord {
  id: string
  amount: number
  type: 'payment' | 'expense'
  date: string
}

// Your raw data (from API)
const myApiRecords: FinancialRecord[] = [
  { id: '1', amount: 5000, type: 'payment', date: '2026-06-21T10:00:00Z' },
  { id: '2', amount: 2000, type: 'expense', date: '2026-06-22T14:00:00Z' },
  { id: '3', amount: 12000, type: 'payment', date: '2026-06-29T11:00:00Z' },
  { id: '4', amount: 3000, type: 'payment', date: '2026-06-29T14:00:00Z' } // Added a second payment to demonstrate grouping
]

const FinancePage: React.FC = () => {
  // Custom Tooltip Formatter (Totals Only)
  const renderTooltip = ({ category, seriesData }: any) => {
    // Guard: If seriesData is missing or empty, return empty string
    if (!seriesData || seriesData.length === 0) return ''

    const metricRows = seriesData
      .map((s: any) => {
        // Safely parse the value, defaulting to 0 if undefined
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

  return (
    <TimelineDashboard<FinancialRecord>
      title='Cash Flow Overview'
      records={myApiRecords}
      getDate={record => record.date}
      seriesConfig={[
        {
          name: 'Payments Accepted',
          color: '#2e7d32', // Green
          matchRecord: r => r.type === 'payment',
          getValue: r => r.amount
        },
        {
          name: 'Expenses',
          color: '#d32f2f', // Red
          matchRecord: r => r.type === 'expense',
          getValue: r => r.amount
        }
      ]}
      valueFormatter={val => `₹${(val ?? 0).toLocaleString('en-IN')}`}
      tooltipFormatter={renderTooltip} // Pass the custom tooltip function here!
    />
  )
}

export default FinancePage
