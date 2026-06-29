import React, { useMemo, useState } from 'react'

import DynamicTimelineChart, { TimelineChartData, TimeFrequency, TooltipParams } from './TimelineChart'

export interface SeriesConfig<T> {
  name: string
  color: string
  matchRecord: (record: T) => boolean
  getValue: (record: T) => number
}

interface TimelineDashboardProps<T> {
  records: T[]
  getDate: (record: T) => Date | string
  seriesConfig: SeriesConfig<T>[]
  valueFormatter?: (val: number) => string
  tooltipFormatter?: (params: TooltipParams<T>) => string
  onRequestChange?: (newProps: { startDate: string; endDate: string; unit: TimeFrequency }) => void
  initialFrequency?: TimeFrequency // NEW: Sync initial load
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// NEW: Extracted date logic so both UI and API requests can share it instantly
const getDateRange = (referenceDate: Date, frequency: TimeFrequency) => {
  let startDate = new Date(referenceDate)
  let endDate = new Date(referenceDate)
  let categories: string[] = []
  let dateRangeLabel = ''

  if (frequency === 'week') {
    startDate.setDate(referenceDate.getDate() - referenceDate.getDay())
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    categories = DAY_NAMES
    dateRangeLabel = `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getDate()} - ${MONTH_NAMES[endDate.getMonth()]} ${endDate.getDate()}, ${startDate.getFullYear()}`
  } else if (frequency === 'month') {
    startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
    endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999)
    categories = Array.from({ length: endDate.getDate() }, (_, i) => (i + 1).toString())
    dateRangeLabel = `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear()}`
  } else if (frequency === 'year') {
    startDate = new Date(referenceDate.getFullYear(), 0, 1)
    endDate = new Date(referenceDate.getFullYear(), 11, 31, 23, 59, 59, 999)
    categories = MONTH_NAMES
    dateRangeLabel = `${startDate.getFullYear()}`
  }

  return { startDate, endDate, categories, dateRangeLabel }
}

const TimelineDashboard = <T,>({
  records,
  getDate,
  seriesConfig,
  valueFormatter,
  tooltipFormatter,
  onRequestChange,
  initialFrequency = 'month' // Defaulting to month to match your FinancePage
}: TimelineDashboardProps<T>) => {
  const [frequency, setFrequency] = useState<TimeFrequency>(initialFrequency)
  const [referenceDate, setReferenceDate] = useState<Date>(new Date())

  // NEW: Instantly formats and fires the API request
  const notifyChange = (date: Date, freq: TimeFrequency) => {
    if (!onRequestChange) return
    const { startDate, endDate } = getDateRange(date, freq)

    onRequestChange({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      unit: freq
    })
  }

  const handlePrevious = () => {
    // 1. Calculate the new date safely outside the updater
    const newDate = new Date(referenceDate)
    if (frequency === 'week') newDate.setDate(newDate.getDate() - 7)
    if (frequency === 'month') newDate.setMonth(newDate.getMonth() - 1)
    if (frequency === 'year') newDate.setFullYear(newDate.getFullYear() - 1)

    // 2. Update local state
    setReferenceDate(newDate)

    // 3. Instantly notify the parent (FinancePage) with the correct dates
    notifyChange(newDate, frequency)
  }

  const handleNext = () => {
    // 1. Calculate the new date safely outside the updater
    const newDate = new Date(referenceDate)
    if (frequency === 'week') newDate.setDate(newDate.getDate() + 7)
    if (frequency === 'month') newDate.setMonth(newDate.getMonth() + 1)
    if (frequency === 'year') newDate.setFullYear(newDate.getFullYear() + 1)

    // 2. Update local state
    setReferenceDate(newDate)

    // 3. Instantly notify the parent (FinancePage) with the correct dates
    notifyChange(newDate, frequency)
  }

  const handleFrequencyChange = (newFreq: TimeFrequency) => {
    setFrequency(newFreq)
    const newDate = new Date() // Reset to today on freq change
    setReferenceDate(newDate)
    notifyChange(newDate, newFreq)
  }

  const chartData = useMemo<TimelineChartData<T> | null>(() => {
    const { startDate, endDate, categories, dateRangeLabel } = getDateRange(referenceDate, frequency)

    const validRecords = records.filter(r => {
      const d = new Date(getDate(r))

      return d >= startDate && d <= endDate
    })

    const seriesData = seriesConfig.map(config => ({
      name: config.name,
      color: config.color,
      data: new Array(categories.length).fill(0),
      total: 0
    }))

    const bucketedRecords: T[][] = Array.from({ length: categories.length }, () => [])

    validRecords.forEach(record => {
      const d = new Date(getDate(record))
      let bucketIndex = 0

      if (frequency === 'week') bucketIndex = d.getDay()
      if (frequency === 'month') bucketIndex = d.getDate() - 1
      if (frequency === 'year') bucketIndex = d.getMonth()

      bucketedRecords[bucketIndex].push(record)

      seriesConfig.forEach((config, idx) => {
        if (config.matchRecord(record)) {
          const val = config.getValue(record)
          seriesData[idx].data[bucketIndex] += val
          seriesData[idx].total += val
        }
      })
    })

    return {
      dateRangeLabel,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      categories,
      series: seriesData.map(s => ({ name: s.name, data: s.data, color: s.color })),
      summary: seriesData.map(s => ({ label: s.name, value: s.total, color: s.color })),
      bucketedRecords
    }
  }, [referenceDate, frequency, records, getDate, seriesConfig])

  // NOTE: The nasty useEffect has been entirely deleted!

  return (
    <DynamicTimelineChart<T>
      data={chartData}
      frequency={frequency}
      onFrequencyChange={handleFrequencyChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      valueFormatter={valueFormatter}
      tooltipFormatter={tooltipFormatter}
    />
  )
}

export default TimelineDashboard
