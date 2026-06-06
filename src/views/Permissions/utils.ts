export const getFormattedName = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

export const extractAllPermissions = (node: any): string[] => {
  let perms: string[] = []
  Object.values(node).forEach(value => {
    if (typeof value === 'string') {
      perms.push(value)
    } else if (typeof value === 'object' && value !== null) {
      perms = perms.concat(extractAllPermissions(value))
    }
  })

  return perms
}
