import React, { useMemo } from 'react'

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
  startDate: string
  endDate: string
  frequency: TimeFrequency
  valueFormatter?: (val: number) => string
  tooltipFormatter?: (params: TooltipParams<T>) => string
  onRequestChange: (newProps: { startDate: string; endDate: string; unit: TimeFrequency }) => void
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const TimelineDashboard = <T,>({
  records,
  getDate,
  seriesConfig,
  startDate,
  endDate,
  frequency,
  valueFormatter,
  tooltipFormatter,
  onRequestChange
}: TimelineDashboardProps<T>) => {
  // Shift start and end dates synchronously
  const shiftDates = (direction: 1 | -1) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (frequency === 'week') {
      start.setDate(start.getDate() + 7 * direction)
      end.setDate(end.getDate() + 7 * direction)
    } else if (frequency === 'month') {
      start.setMonth(start.getMonth() + 1 * direction)
      end.setMonth(end.getMonth() + 1 * direction)
    } else if (frequency === 'year') {
      // Retains exactly custom academic/financial dates by shifting exactly 1 year
      start.setFullYear(start.getFullYear() + 1 * direction)
      end.setFullYear(end.getFullYear() + 1 * direction)
    }

    onRequestChange({ startDate: formatDate(start), endDate: formatDate(end), unit: frequency })
  }

  const handleFrequencyChange = (newFreq: TimeFrequency) => {
    // Reset to sensible defaults based on dropdown selection
    const today = new Date()
    let newStart = new Date(today)
    let newEnd = new Date(today)

    if (newFreq === 'week') {
      newStart.setDate(today.getDate() - today.getDay())
      newEnd = new Date(newStart)
      newEnd.setDate(newStart.getDate() + 6)
    } else if (newFreq === 'month') {
      newStart = new Date(today.getFullYear(), today.getMonth(), 1)
      newEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    } else if (newFreq === 'year') {
      newStart = new Date(today.getFullYear(), 0, 1)
      newEnd = new Date(today.getFullYear(), 11, 31)
    }

    onRequestChange({ startDate: formatDate(newStart), endDate: formatDate(newEnd), unit: newFreq })
  }

  const chartData = useMemo<TimelineChartData<T> | null>(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))

    // 1. Dynamic X-Axis Generation based purely on date difference
    const buckets: { label: string; start: Date; end: Date }[] = []

    if (diffDays <= 60) {
      // Daily Buckets
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dStart = new Date(d)
        dStart.setHours(0, 0, 0, 0)
        const dEnd = new Date(d)
        dEnd.setHours(23, 59, 59, 999)
        buckets.push({ label: `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`, start: dStart, end: dEnd })
      }
    } else if (diffDays <= 366) {
      // Monthly Buckets
      const current = new Date(start.getFullYear(), start.getMonth(), 1)
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
      while (current <= endMonth) {
        const mStart = new Date(current)
        const mEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999)
        buckets.push({ label: `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`, start: mStart, end: mEnd })
        current.setMonth(current.getMonth() + 1)
      }
    } else {
      // Yearly Buckets
      let currentYear = start.getFullYear()
      while (currentYear <= end.getFullYear()) {
        const yStart = new Date(currentYear, 0, 1)
        const yEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999)
        buckets.push({ label: `${currentYear}`, start: yStart, end: yEnd })
        currentYear++
      }
    }

    // 2. Filter valid records
    const validRecords = records.filter(r => {
      const d = new Date(getDate(r))

      return d >= start && d <= new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
    })

    // 3. Initialize series and bucketed arrays
    const seriesData = seriesConfig.map(config => ({
      name: config.name,
      color: config.color,
      data: new Array(buckets.length).fill(0),
      total: 0
    }))
    const bucketedRecords: T[][] = Array.from({ length: buckets.length }, () => [])

    // 4. Map records into their correct dynamic buckets
    validRecords.forEach(record => {
      const d = new Date(getDate(record))

      // Find which bucket this date belongs to
      const bucketIndex = buckets.findIndex(b => d >= b.start && d <= b.end)

      if (bucketIndex !== -1) {
        bucketedRecords[bucketIndex].push(record)
        seriesConfig.forEach((config, idx) => {
          if (config.matchRecord(record)) {
            const val = config.getValue(record)
            seriesData[idx].data[bucketIndex] += val
            seriesData[idx].total += val
          }
        })
      }
    })

    return {
      categories: buckets.map(b => b.label),
      series: seriesData.map(s => ({ name: s.name, data: s.data, color: s.color })),
      summary: seriesData.map(s => ({ label: s.name, value: s.total, color: s.color })),
      bucketedRecords
    }
  }, [startDate, endDate, records, getDate, seriesConfig])

  return (
    <DynamicTimelineChart<T>
      data={chartData}
      startDate={startDate}
      endDate={endDate}
      frequency={frequency}
      onFrequencyChange={handleFrequencyChange}
      onDateChange={(start, end) => onRequestChange({ startDate: start, endDate: end, unit: frequency })}
      onNext={() => shiftDates(1)}
      onPrevious={() => shiftDates(-1)}
      valueFormatter={valueFormatter}
      tooltipFormatter={tooltipFormatter}
    />
  )
}

export default TimelineDashboard
