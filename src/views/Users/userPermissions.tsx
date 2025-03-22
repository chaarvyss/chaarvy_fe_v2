import { Button, Checkbox, FormControlLabel, FormGroup, Grid } from '@mui/material'
import { Box, Typography } from '@muiElements'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Permissions } from 'src/constants/permissions'
import { useGetUserPermissionsQuery, useUpdateUserPermissionsMutation } from 'src/store/services/adminServices'

interface UserPermissionsProps {
  user_id: string
}

const UserPermissions = ({ user_id }: UserPermissionsProps) => {
  const [allowedPermissions, setAllowedPermissions] = useState<Set<string>>(new Set())

  const { data: current_available_permissions } = useGetUserPermissionsQuery(user_id)

  useEffect(() => {
    if (current_available_permissions) {
      setAllowedPermissions(new Set(current_available_permissions))
    }
  }, [current_available_permissions])

  const { triggerToast } = useToast()
  const [updatePermissions] = useUpdateUserPermissionsMutation()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAllowedPermissions(prevIds => {
      const newIds = new Set(prevIds)
      e.target.checked ? newIds.add(e.target.id) : newIds.delete(e.target.id)
      return new Set(newIds)
    })
  }

  const handleSubmit = () => {
    updatePermissions({
      user_id,
      available_permissions: Array.from(allowedPermissions).filter(e => e !== undefined)
    })
      .unwrap()
      .then(response => {
        triggerToast(response, { variant: ToastVariants.SUCCESS })
      })
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }

  return (
    <Box gap={4}>
      <Typography variant='body1'>Side Menus</Typography>
      <Box>
        <FormGroup>
          <Grid container spacing={2}>
            {Object.entries(Permissions.NAV).map(([key, value]) => (
              <Grid item sm={12} md={4}>
                <FormControlLabel
                  key={value}
                  control={<Checkbox id={value} onChange={handleChange} checked={allowedPermissions.has(value)} />}
                  label={key}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Box>
      <Box>
        <Button onClick={handleSubmit}>Update Permissions</Button>
      </Box>
    </Box>
  )
}

export default UserPermissions
