export const getAllQueryParams = (): Record<string, string> => {
  if (typeof globalThis.window === 'undefined') {
    return {}
  }
  const params = new URLSearchParams(globalThis.window.location.search)
  const queryParams: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    queryParams[key] = value
  }

  return queryParams
}

export const ensureDate = (value: string | Date | null | undefined | number | boolean): Date | null => {
  if (!value) return null

  // 1. If it's already a Date object, return it if valid
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  // 2. Handle DD/MM/YYYY string format
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/').map(Number)
    const date = new Date(year, month - 1, day)

    return isNaN(date.getTime()) ? null : date
  }

  // 3. Handle YYYY-MM-DD string format (or any standard ISO date)
  // new Date("2026-03-30") works natively in all modern browsers
  const parsedDate = new Date(value as string | number)

  return isNaN(parsedDate.getTime()) ? null : parsedDate
}
