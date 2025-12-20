import { format } from 'date-fns'

import store from 'src/store'

import { DateFormatTypes } from '../types'

export const isPermitted = (permissionId: string) => {
  return store.getState().permission?.data?.includes(permissionId)
}

export const getEmptyKeysList = (object: Record<string, any>): string[] => {
  return Object.entries(object)
    .map(([key, value]) => {
      if (value == '') return key
    })
    .filter(each => each != undefined) as string[]
}

export const dateToString = (date?: Date, dateFormat?: DateFormatTypes) => {
  if (!date || !dateFormat) return undefined

  return format(new Date(date), dateFormat)
}
