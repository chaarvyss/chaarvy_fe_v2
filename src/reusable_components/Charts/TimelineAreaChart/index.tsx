import React, { useState, useMemo } from 'react'
import { Card } from '@mui/material'
import DynamicTimelineChart, { TimelineChartData, TimeFrequency, TooltipParams } from './TimelineChart'

export interface SeriesConfig<T> {
  name: string
  color: string
  matchRecord: (record: T) => boolean
  getValue: (record: T) => number
}

interface TimelineDashboardProps<T> {
  title: string
  records: T[]
  getDate: (record: T) => Date | string
  seriesConfig: SeriesConfig<T>[]
  valueFormatter?: (val: number) => string
  tooltipFormatter?: (params: TooltipParams<T>) => string // Propagate custom tooltip
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const TimelineDashboard = <T,>({
  title,
  records,
  getDate,
  seriesConfig,
  valueFormatter,
  tooltipFormatter
}: TimelineDashboardProps<T>) => {
  const [frequency, setFrequency] = useState<TimeFrequency>('week')
  const [referenceDate, setReferenceDate] = useState<Date>(new Date())

  const handlePrevious = () => {
    setReferenceDate(prev => {
      const d = new Date(prev)
      if (frequency === 'week') d.setDate(d.getDate() - 7)
      if (frequency === 'month') d.setMonth(d.getMonth() - 1)
      if (frequency === 'year') d.setFullYear(d.getFullYear() - 1)
      return d
    })
  }

  const handleNext = () => {
    setReferenceDate(prev => {
      const d = new Date(prev)
      if (frequency === 'week') d.setDate(d.getDate() + 7)
      if (frequency === 'month') d.setMonth(d.getMonth() + 1)
      if (frequency === 'year') d.setFullYear(d.getFullYear() + 1)
      return d
    })
  }

  const chartData = useMemo<TimelineChartData<T> | null>(() => {
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

    // NEW: Initialize empty arrays to store raw records per bucket
    const bucketedRecords: T[][] = Array.from({ length: categories.length }, () => [])

    validRecords.forEach(record => {
      const d = new Date(getDate(record))
      let bucketIndex = 0

      if (frequency === 'week') bucketIndex = d.getDay()
      if (frequency === 'month') bucketIndex = d.getDate() - 1
      if (frequency === 'year') bucketIndex = d.getMonth()

      // Store the raw record in its respective time bucket
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
      categories,
      series: seriesData.map(s => ({ name: s.name, data: s.data, color: s.color })),
      summary: seriesData.map(s => ({ label: s.name, value: s.total, color: s.color })),
      bucketedRecords
    }
  }, [referenceDate, frequency, records, getDate, seriesConfig])

  return (
    <DynamicTimelineChart<T>
      // title={title}
      data={chartData}
      frequency={frequency}
      onFrequencyChange={newFreq => {
        setFrequency(newFreq)
        setReferenceDate(new Date())
      }}
      onNext={handleNext}
      onPrevious={handlePrevious}
      valueFormatter={valueFormatter}
      tooltipFormatter={tooltipFormatter}
    />
  )
}

export default TimelineDashboard
