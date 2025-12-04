// ** Types Imports
import { Button, Checkbox, FormControlLabel, FormGroup, Grid, IconButton, TextField, Typography } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Permissions } from 'src/constants/permissions'
import { InputVariants } from 'src/lib/enums'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useCreateUpdateRoleMutation } from 'src/store/services/adminServices'
import { useLazyGetRolesListQuery, useLazyGetRolePermissionsListQuery } from 'src/store/services/listServices'
import GetChaarvyIcons from 'src/utils/icons'
import {
  Card,
  Chip,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from 'src/utils/muiElements'

interface RowType {
  role_name: string
  role_id: string
  status?: number
}

// TODO: NEED TO IMPROVE. BASE TEMPATE AVAILABLE

const Roles = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>()
  const [allowedPermissions, setAllowedPermissions] = useState<Set<string>>(new Set())

  const [role_name, setRole_name] = useState<string>()
  const [fetchRoles, { data: rolesList }] = useLazyGetRolesListQuery()

  const [showCreateOrEditRoleModal, setShowCreateOrEditRoleModal] = useState<boolean>(false)

  const [fetchRolePermissions, { data: rolePermissions }] = useLazyGetRolePermissionsListQuery()

  const [createUpdateRole] = useCreateUpdateRoleMutation()

  const { triggerToast } = useToast()

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleModalClose = () => {
    setShowCreateOrEditRoleModal(false)
    setSelectedRoleId(undefined)
    setRole_name('')
  }

  const handleSubmit = () => {
    const available_permissions = Array.from(allowedPermissions).filter(e => e !== undefined)
    if (role_name)
      createUpdateRole({ role_id: selectedRoleId, permissions: available_permissions, role_name }).then(res => {
        if (res) {
          triggerToast('Role details updated', { variant: ToastVariants.SUCCESS })
          if (selectedRoleId === undefined) fetchRoles()
          handleModalClose()
        }
      })
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAllowedPermissions(prevIds => {
      const newIds = new Set(prevIds)
      e.target.checked ? newIds.add(e.target.id) : newIds.delete(e.target.id)

      return new Set(newIds)
    })
  }

  const handleEditRole = role => {
    fetchRolePermissions(role.role_id)
      .unwrap()
      .then(res => {
        setAllowedPermissions(new Set(res))
        setShowCreateOrEditRoleModal(true)
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
        <div className='p-2'>
          <div>
            <Typography variant='subtitle1'>Role Name</Typography>
            <TextField
              size='small'
              onChange={e => setRole_name(e.target.value)}
              value={role_name}
              type={InputVariants.STRING}
            />
          </div>
          {/* <div className='mt-3'>
            <Typography variant='subtitle1'>Default Permissions</Typography>
          </div>
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
          </FormGroup> */}
          <div className='d-flex justify-content-center mt-5 '>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </div>
      </ChaarvyModal>
    )
  }

  return (
    <>
      {TableTilteHeader({
        title: 'Roles',
        buttonTitle: 'Create Role',
        onButtonClick: () => setShowCreateOrEditRoleModal(true)
      })}
      <Paper>
        <Card>
          {createUpdateRoleModal()}

          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rolesList ?? []).map((row: RowType, index: number) => (
                  <TableRow hover key={row.role_id} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.role_name}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Paper>
    </>
  )
}

export default Roles
