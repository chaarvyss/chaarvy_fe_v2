export const pxToMm = (px: number) => px / 3.78

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

export const urlToBase64 = (url: string): Promise<string> => {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        alert('Failed to fetch image: ' + url + '\nStatus: ' + response.status)
        throw new Error('Failed to fetch image: ' + url)
      }
      return response.blob()
    })
    .then(
      blob =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') resolve(reader.result)
            else reject('Failed to convert image to base64')
          }
          reader.onerror = e => {
            alert('Failed to read image as base64. Possible CORS issue.')
            reject(e)
          }
          reader.readAsDataURL(blob)
        })
    )
    .catch(error => {
      alert(
        'Image fetch or conversion failed: ' +
          error.message +
          '\nURL: ' +
          url +
          '\nCheck CORS and network. See console for details.'
      )
      throw error
    })
}

export const groupFieldsByPage = (fields: any[]) => {
  const pages: { [key: number]: any[] } = { 0: [] }
  fields.forEach(field => {
    const page = (field as any).page || 0
    if (!pages[page]) {
      pages[page] = []
    }
    pages[page].push(field)
  })
  return pages
}
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

export const isValidEmail = email => {
  return /\S+@\S+\.\S+/.test(email)
}

export const isValidPhone = phone => {
  return /^[6-9]\d{9}$/.test(phone)
}
