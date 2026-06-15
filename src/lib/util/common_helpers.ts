export const getAllQueryParams = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {}
  }
  const params = new URLSearchParams(window.location.search)
  const queryParams: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    queryParams[key] = value
  }

  return queryParams
}
