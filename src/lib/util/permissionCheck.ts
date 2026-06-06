import store from 'src/store'

import { decryptData } from './dataEncryptor'

export const isAuthorised = (permissionId: string): boolean => {
  const allowedPermissions = decryptData(store.getState().permission.data)

  return (allowedPermissions ?? []).includes(permissionId)
}
