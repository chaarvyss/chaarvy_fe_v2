import { Button, CircularProgress, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { Box, FormControl, Grid, TextField, Typography } from '@muiElements'
import React, { ChangeEvent, useState } from 'react'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { InputVariants } from 'src/lib/enums'
import { useCreateUpdateUserMutation } from 'src/store/services/adminServices'
import { useGetRolesListQuery } from 'src/store/services/listServices'
import { UserProfile } from 'src/store/services/viewServices'

enum FormType {
  BASE_DETAIL = 'base_detail',
  ADDRESS = 'address',
  PERMISSIONS = 'permissions'
}

interface CreateUserRequest {
  email: string
  mobile: string
  name: string
  username: string
  Role: string
}

const baseProfileKeys = [
  { v: 'name', l: 'Name' },
  { v: 'username', l: 'Username' },
  { v: 'mobile', l: 'Mobile' },
  { v: 'email', l: 'Email' }
]

const CreateUser = () => {
  const [newDetails, setNewDetails] = useState<UserProfile>()
  const [updateUserProfile] = useCreateUpdateUserMutation()
  const { triggerToast } = useToast()

  const { closeDrawer } = useSideDrawer()

  const { data: rolesData, isLoading: isRolesListLoading } = useGetRolesListQuery()

  const handleChange =
    (prop: keyof UserProfile) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) =>
      setNewDetails(prev => ({ ...prev, [prop]: event?.target?.value ?? event }))

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
      <Grid container spacing={7}>
        {baseProfileKeys.map(field => (
          <Grid item xs={12} key={field.v}>
            <Box display='flex' flexDirection='column'>
              <small>{field.l.replace('_', ' ').toUpperCase()}</small>
              <TextField
                onChange={handleChange(field.v as keyof UserProfile)}
                value={newDetails?.[field.v as keyof UserProfile]}
                disabled={field.v == 'created_on'}
                type={field.v === 'mobile' ? InputVariants.NUMBER : 'text'}
              />
            </Box>
          </Grid>
        ))}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Typography>Role</Typography>
            <Select value={newDetails?.Role ?? ''} onChange={handleChange('Role')}>
              {isRolesListLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : (
                (rolesData ?? []).map(({ role_id, role_name }) => (
                  <MenuItem key={role_id} value={role_id}>
                    {role_name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Button variant='contained' onClick={handleSubmit}>
            Create User
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CreateUser
