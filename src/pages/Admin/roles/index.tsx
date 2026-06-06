// ** Types Imports
import { IconButton, TextField, Typography, Box } from '@mui/material'
import { useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { InputVariants } from 'src/lib/enums'
import { RolesListResponse } from 'src/lib/types'
import { LoadingSpinner } from 'src/reusable_components'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useCreateUpdateRoleMutation } from 'src/store/services/adminServices'
import { useGetRolesListQuery, useLazyGetRolePermissionsListQuery } from 'src/store/services/listServices'
import GetChaarvyIcons from 'src/utils/icons'
import PermissionsEditor from 'src/views/Permissions'

const Roles = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>()

  const [role_name, setRole_name] = useState<string>()
  const { data: rolesList, isFetching: isLoadingRoles } = useGetRolesListQuery()

  const [showCreateOrEditRoleModal, setShowCreateOrEditRoleModal] = useState<boolean>(false)

  const [
    fetchRolePermissions,
    { data: rolePermissions, isFetching: isLoadingRolePermissions, reset: resetRolePermissions }
  ] = useLazyGetRolePermissionsListQuery()

  const [createUpdateRole, { isLoading: isSubmitting }] = useCreateUpdateRoleMutation()

  const { triggerToast } = useToast()

  const handleModalClose = () => {
    setShowCreateOrEditRoleModal(false)
    setSelectedRoleId(undefined)
    setRole_name('')
  }

  const handleSubmit = (available_permissions: string[]) => {
    if (role_name)
      createUpdateRole({ role_id: selectedRoleId, permissions: available_permissions, role_name })
        .unwrap()
        .then(res => {
          if (res) {
            triggerToast('Role details updated', { variant: ToastVariants.SUCCESS })
            handleModalClose()
          }
        })
        .catch(e => triggerToast(e, { variant: ToastVariants.ERROR }))
  }

  const handleEditRole = (role: RolesListResponse) => {
    setShowCreateOrEditRoleModal(true)
    fetchRolePermissions(role.role_id)
      .unwrap()
      .then(() => {
        setSelectedRoleId(role.role_id)
        setRole_name(role.role_name)
      })
  }

  const createUpdateRoleModal = () => {
    return (
      <ChaarvyModal
        modalSize='col-12 col-md-8 col-xxl-6'
        title={`${selectedRoleId ? 'Edit' : 'Create'} Role`}
        isOpen={showCreateOrEditRoleModal}
        onClose={handleModalClose}
      >
        <Box height='76vh'>
          <Box ml={5}>
            <Typography variant='subtitle1'>Role Name</Typography>
            <TextField
              size='small'
              onChange={e => setRole_name(e.target.value)}
              value={role_name}
              type={InputVariants.STRING}
            />
          </Box>
          <Box sx={{ overflow: 'auto', height: '80%' }}>
            {isLoadingRolePermissions ? (
              <LoadingSpinner />
            ) : (
              <PermissionsEditor
                initialSelected={rolePermissions ?? []}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            )}
          </Box>
        </Box>
      </ChaarvyModal>
    )
  }

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'sno',
      label: '#',
      render: (_, index) => <Typography>{index + 1}</Typography>
    },
    {
      id: 'role_name',
      label: 'Role'
    },
    {
      id: 'actions',
      label: 'Action',
      render: row => (
        <IconButton
          size='small'
          aria-label='settings'
          className='card-more-options'
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            handleEditRole(row)
          }}
        >
          <GetChaarvyIcons iconName='Pencil' fontSize='1.25rem' />
        </IconButton>
      )
    }
  ]

  const handleCreateRole = () => {
    resetRolePermissions()
    setShowCreateOrEditRoleModal(true)
  }

  return (
    <>
      <ChaarvyTable
        tableTitleHeaderProps={{
          title: 'Roles',
          buttonTitle: 'Create Role',
          onButtonClick: handleCreateRole
        }}
        tableDataProps={{
          columns,
          data: rolesList ?? [],
          getRowKey: row => row.application_id,
          emptyMessage: 'No Roles available',
          isLoading: isLoadingRoles
        }}
      />

      {createUpdateRoleModal()}
    </>
  )
}

export default Roles
