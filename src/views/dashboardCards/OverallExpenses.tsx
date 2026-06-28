import React from 'react'
import TimelineDashboard from 'src/reusable_components/Charts/TimelineAreaChart'

interface ExpenseRecord {
  id: string
  amount: number
  category: string
  beneficiaryType: string
  date_of_payment: string
}

const mockExpenses: ExpenseRecord[] = [
  { id: '1', amount: 1500, category: 'Meals', beneficiaryType: 'Employee', date_of_payment: '2026-06-28T09:30:00Z' },
  { id: '2', amount: 4000, category: 'Travel', beneficiaryType: 'Vendor', date_of_payment: '2026-06-28T14:15:00Z' },
  {
    id: '3',
    amount: 12000,
    category: 'Travel',
    beneficiaryType: 'Marketing executive',
    date_of_payment: '2026-06-25T10:00:00Z'
  },
  { id: '4', amount: 8000, category: 'Supplies', beneficiaryType: 'Vendor', date_of_payment: '2026-06-26T11:00:00Z' },
  { id: '5', amount: 25000, category: 'Travel', beneficiaryType: 'Employee', date_of_payment: '2026-06-05T09:00:00Z' },
  { id: '6', amount: 18000, category: 'Meals', beneficiaryType: 'Vendor', date_of_payment: '2026-06-15T09:00:00Z' },
  { id: '7', amount: 150000, category: 'Travel', beneficiaryType: 'Employee', date_of_payment: '2026-02-10T09:00:00Z' },
  { id: '8', amount: 80000, category: 'Meals', beneficiaryType: 'Vendor', date_of_payment: '2026-04-22T09:00:00Z' },
  {
    id: '9',
    amount: 220000,
    category: 'Supplies',
    beneficiaryType: 'Contractor',
    date_of_payment: '2026-05-18T09:00:00Z'
  }
]

const OverallExpensesDashboardCard: React.FC = () => {
  // Custom HTML Tooltip Formatter
  // Updated Tooltip Formatter
  const renderBreakdownTooltip = ({
    category,
    seriesData,
    records
  }: {
    category: string
    seriesData: { seriesName: string; value: number; color: string }[]
    records: ExpenseRecord[]
  }) => {
    // 1. Guard clause
    if (!records || records.length === 0) return ''

    // 2. Aggregate data from the records provided for this specific time bucket
    const catAggs: Record<string, number> = {}
    const benAggs: Record<string, number> = {}

    records.forEach(r => {
      catAggs[r.category] = (catAggs[r.category] || 0) + r.amount
      benAggs[r.beneficiaryType] = (benAggs[r.beneficiaryType] || 0) + r.amount
    })

    // 3. Helper to build the rows
    const buildRows = (aggs: Record<string, number>) =>
      Object.entries(aggs)
        .map(
          ([name, amt]) => `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                             <span style="color: #555;">${name}:</span> 
                             <strong>₹${amt.toLocaleString('en-IN')}</strong>
                           </div>`
        )
        .join('')

    // 4. Build the header (Shared total for the bucket)
    const totalValue = seriesData.reduce((sum, s) => sum + (s.value ?? 0), 0)

    return `
    <div style="padding: 12px; font-family: inherit; min-width: 200px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 6px; background: #fff; border: 1px solid #eaeaea;">
      <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
        <span style="font-size: 12px; color: #757575; font-weight: 600;">${category}</span><br/>
        <strong style="font-size: 16px; color: #333;">Total: ₹${totalValue.toLocaleString('en-IN')}</strong>
      </div>
      
      <div style="margin-bottom: 8px;">
         <div style="font-size: 11px; font-weight: bold; color: #9e9e9e; margin-bottom: 4px;">CATEGORIES</div>
         <div style="font-size: 13px;">${buildRows(catAggs)}</div>
      </div>

      <div>
         <div style="font-size: 11px; font-weight: bold; color: #9e9e9e; margin-bottom: 4px;">BENEFICIARIES</div>
         <div style="font-size: 13px;">${buildRows(benAggs)}</div>
      </div>
    </div>
  `
  }

  return (
    <TimelineDashboard<ExpenseRecord>
      title='Overall Expenses'
      records={mockExpenses}
      getDate={record => record.date_of_payment}
      seriesConfig={[
        {
          name: 'Expenses',
          color: '#f55252',
          matchRecord: () => true, // Match all records since this is an "Expenses Only" dashboard
          getValue: r => r.amount
        }
      ]}
      valueFormatter={val => `₹${val.toLocaleString('en-IN')}`}
      tooltipFormatter={renderBreakdownTooltip} // Pass the custom UI breakdown here
    />
  )
}

export default OverallExpensesDashboardCard
