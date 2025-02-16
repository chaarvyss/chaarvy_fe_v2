import store from 'src/store'

export const isPermitted = (permissionId: string) => {
  return store.getState().permission?.data?.includes(permissionId)
}

export const getEmptyKeysList = (object: Object) => {
  return Object.entries(object)
    .map(([key, value]) => {
      if (value == '') return key
    })
    .filter(each => each != undefined)
}
