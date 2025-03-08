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

export const getInitials = (name: string, length: number = 2): string => {
  const initials = name
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('')

  return initials.slice(0, length)
}
