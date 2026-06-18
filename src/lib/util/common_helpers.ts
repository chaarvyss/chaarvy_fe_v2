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
