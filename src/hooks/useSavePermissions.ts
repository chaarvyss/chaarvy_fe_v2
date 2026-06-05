import { useDispatch } from 'react-redux'

import { encryptData } from 'src/lib/util/dataEncryptor'
import { setAvailablePermissionsData } from 'src/store/permissionSlice'

export const useSavePermissions = () => {
  const dispatch = useDispatch()

  return (permissions: string[]) => {
    const enc_data = encryptData(permissions)
    dispatch(setAvailablePermissionsData(enc_data))
  }
}
