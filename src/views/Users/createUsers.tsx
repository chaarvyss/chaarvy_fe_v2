import { Button, SelectChangeEvent } from '@mui/material'
import React, { ChangeEvent, useState } from 'react'

import { Box } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { InputTypes, InputVariants } from 'src/lib/enums'
import { InputFields } from 'src/lib/types'
import FormGenerator from 'src/reusable_components/formGenerator'
import { useCreateUpdateUserMutation } from 'src/store/services/adminServices'
import { useGetRolesListQuery } from 'src/store/services/listServices'
import { UserProfile } from 'src/store/services/viewServices'

const CreateUser = () => {
  const [newDetails, setNewDetails] = useState<UserProfile>()
  const [updateUserProfile] = useCreateUpdateUserMutation()
  const { triggerToast } = useToast()

  const { closeDrawer } = useSideDrawer()

  const { data: rolesData, isLoading: isRolesListLoading } = useGetRolesListQuery()

  const handleChange =
    (prop: keyof UserProfile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      setNewDetails(prev => ({ ...prev, [prop]: event?.target?.value ?? event }))

      // Example: You can trigger side effects here when specific fields change
      // if (prop === 'state') {
      //   fetchDistrictsList(event.target.value)
      // }
    }

  const fields: InputFields[] = [
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: 'create-user-name',
      key: 'name',
      label: 'Name',
      value: newDetails?.name ?? '',
      onChange: handleChange('name')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.STRING,
      id: 'create-user-username',
      key: 'username',
      label: 'Username',
      value: newDetails?.username ?? '',
      onChange: handleChange('username')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.NUMBER,
      id: 'create-user-mobile',
      key: 'mobile',
      label: 'Mobile',
      value: newDetails?.mobile ?? '',
      onChange: handleChange('mobile')
    },
    {
      type: InputTypes.INPUT,
      variant: InputVariants.EMAIL,
      id: 'create-user-email',
      key: 'email',
      label: 'Email',
      value: newDetails?.email ?? '',
      onChange: handleChange('email')
    },
    {
      type: InputTypes.SELECT,
      id: 'create-user-role',
      key: 'Role',
      label: 'Role',
      value: newDetails?.Role ?? '',
      onChange: handleChange('Role'),
      isLoading: isRolesListLoading,
      // ✅ menuOptions are reactive - they update when rolesData changes
      menuOptions: (rolesData ?? []).map(({ role_id, role_name }) => ({
        value: role_id,
        label: role_name
      }))
      // ✅ For dependent dropdowns, you can:
      // 1. Filter menuOptions based on other field values:
      //    menuOptions: rolesData?.filter(r => r.type === newDetails?.someField)
      // 2. Disable the field until parent is selected:
      //    isDisabled: !newDetails?.parentField
      // 3. Conditionally show/hide by filtering the fields array
    }
  ]

  const handleSubmit = () => {
    if (newDetails) {
      updateUserProfile({ user: newDetails })
        .unwrap()
        .then(res => {
          triggerToast(res, { variant: ToastVariants.SUCCESS })
          closeDrawer()
        })
        .catch(e => {
          triggerToast(e.data, { variant: ToastVariants.ERROR })
        })
    }
  }

  return (
    <Box>
      <FormGenerator fields={fields} mandatoryFields={['name', 'username', 'email', 'Role']} columnSize={{ xs: 12 }} />
      <Box mt={4}>
        <Button variant='contained' onClick={handleSubmit}>
          Create User
        </Button>
      </Box>
    </Box>
  )
}

export default CreateUser
