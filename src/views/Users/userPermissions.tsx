import { Box } from '@muiElements'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { useSavePermissions } from 'src/hooks/useSavePermissions'
import { sessionStorageKeys } from 'src/lib/enums'
import { LoadingSpinner } from 'src/reusable_components'
import { useGetUserPermissionsQuery, useUpdateUserPermissionsMutation } from 'src/store/services/adminServices'

import PermissionsEditor from '../Permissions'

interface UserPermissionsProps {
  user_id: string
}

const UserPermissions = ({ user_id }: UserPermissionsProps) => {
  const savePermissions = useSavePermissions()
  const { data: current_available_permissions, isFetching: isFetchingAvailablePermissions } =
    useGetUserPermissionsQuery(user_id)

  const { triggerToast } = useToast()
  const [updatePermissions, { isLoading: isSubmitting }] = useUpdateUserPermissionsMutation()

  const handleSubmit = (available_permissions: string[]) => {
    updatePermissions({
      user_id,
      available_permissions
    })
      .unwrap()
      .then(response => {
        const current_user = sessionStorage.getItem(sessionStorageKeys.userId)
        if (user_id === current_user) {
          alert('same')
          savePermissions(available_permissions)
        }
        triggerToast(response, { variant: ToastVariants.SUCCESS })
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  return (
    <Box gap={4}>
      {isFetchingAvailablePermissions ? (
        <LoadingSpinner />
      ) : (
        <PermissionsEditor
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          initialSelected={current_available_permissions ?? []}
        />
      )}
    </Box>
  )
}

export default UserPermissions
