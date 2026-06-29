type Event = {
  start: string
  end: string
}

export const GetSumOfNumbers = (arr?: number[]) => arr?.reduce((acc, val) => acc + val, 0) || 0

export const formatDuration = (durationSeconds?: string | number): string => {
  if (durationSeconds === undefined || durationSeconds === null || durationSeconds === '') {
    return '--:--:--'
  }

  const seconds = typeof durationSeconds === 'string' ? Number(durationSeconds) : durationSeconds
  if (Number.isNaN(seconds) || seconds < 0) {
    return '--:--:--'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const paddedHours = String(hours).padStart(2, '0')
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(secs).padStart(2, '0')

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
}

export const convertDateStringToDate = (dateStr?: string) => {
  if (!dateStr) return undefined

  // Match dd/mm/yyyy or dd-mm-yyyy
  const match = dateStr.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)

  if (!match) return undefined

  const [, day, month, year] = match.map(Number)

  const date = new Date(year, month - 1, day)

  // Prevent JS auto-correction (31/02 -> Mar 3)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined
}

export const getInitials = (name: string, length = 2): string => {
  const initials = name
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('')

  return initials.slice(0, length)
}

export const areSetsEqual = (set1: Set<string>, set2: Set<string>) => {
  if (set1.size !== set2.size) return false
  for (const item of set1) {
    if (!set2.has(item)) return false
  }

  return true
}

export const printDocument = (url: string) => {
  const iframe = document.createElement('iframe')

  iframe.style.display = 'none'
  iframe.src = url

  document.body.appendChild(iframe)

  // Wait for the PDF to load inside the iframe
  iframe.onload = () => {
    setTimeout(() => {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        }
      } catch (e) {
        console.error('Iframe print blocked:', e)
      }
    }, 500)
  }
}

export const downloadDocument = (url: string, file_name: string) => {
  const a = document.createElement('a')
  a.href = url
  a.download = file_name
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}

export const formatEventDate = (event: Event): string => {
  const { start, end } = event

  if (start.includes('T') && end.includes('T')) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const date = startDate.toISOString().split('T')[0] // Extracts only the date part
    const startTime = startDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
    const endTime = endDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })

    return `${date} | ${startTime} - ${endTime}`
  } else {
    return `${start} - Full day`
  }
}

const phoneRegex = /^[6-9]\d{9}$/
const aadharRegex = /^\d{12}$/

export const isValidEmail = (email: string): boolean => {
  if (typeof email !== 'string' || email.length > 254) return false

  const parts = email.split('@')
  if (parts.length !== 2) return false

  const [local, domain] = parts

  if (!local || !domain?.includes('.')) return false

  return true
}

export const isValidPhone = (phone: string): boolean => {
  return phoneRegex.test(phone)
}

export const isValidAadhar = (aadhar: string): boolean => {
  return aadharRegex.test(aadhar)
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const monthMap: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11
}

export const normalizeDateInput = (
  value: string | Date | undefined,
  fallback: string,
  referenceYear: number
): string => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value)
  }

  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return fallback
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const shortMonthMatch = trimmed.match(/^([A-Za-z]{3})\s+(\d{1,2})(?:,\s*(\d{4}))?$/)
  if (shortMonthMatch) {
    const [, monthToken, dayToken, yearToken] = shortMonthMatch
    const monthIndex = monthMap[monthToken.toLowerCase()]
    const day = Number(dayToken)
    const year = yearToken ? Number(yearToken) : referenceYear

    if (monthIndex !== undefined) {
      const normalizedDate = new Date(year, monthIndex, day)
      if (
        normalizedDate.getFullYear() === year &&
        normalizedDate.getMonth() === monthIndex &&
        normalizedDate.getDate() === day
      ) {
        return formatDate(normalizedDate)
      }
    }
  }

  const parsed = new Date(trimmed)

  return Number.isNaN(parsed.getTime()) ? fallback : formatDate(parsed)
}
