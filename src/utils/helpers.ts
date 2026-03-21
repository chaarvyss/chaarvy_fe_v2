type Event = {
  start: string
  end: string
}

export const GetSumOfNumbers = (arr?: number[]) => arr?.reduce((acc, val) => acc + val, 0) || 0

const isValidDate = dateStr => {
  const regex = /^\d{2}-\d{2}-\d{4}$/ // Regex to match DD-MM-YYYY format
  if (!regex.test(dateStr)) return false // Check if format is valid

  const [day, month, year] = dateStr.split('-').map(Number)
  if (month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(year, month - 1, day)

  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year
}

export const convertDateStringToDate = (dateStr?: string) => {
  if (!dateStr) return undefined
  if (!isValidDate(dateStr)) {
    console.error('Invalid date format or value:', dateStr)

    return undefined
  }

  const [day, month, year] = dateStr.split('-').map(Number)

  return new Date(year, month - 1, day)
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
  const newTab = window.open(url, '_blank')
  if (newTab) {
    newTab.onload = () => {
      newTab.focus()
      newTab.print()
    }
  } else {
    alert('Popup blocked! Allow popups for this site.')
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

export const isValidPhone = phone => {
  return phoneRegex.test(phone)
}

export const isValidAadhar = aadhar => {
  return aadharRegex.test(aadhar)
}
