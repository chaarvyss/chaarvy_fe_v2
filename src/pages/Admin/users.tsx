import { useEffect } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { Permissions } from 'src/constants/permissions'
import { isPermitted } from 'src/lib/helpers'
import { TableHeaderStatCardProps, UsersListResponse } from 'src/lib/interfaces'
import DropDownMenu, { filterFalseAndInvalid } from 'src/reusable_components/dropDownMenu'
import TableTilteHeader, { TableTitleHeaderProps } from 'src/reusable_components/TableTilteHeader'
import { useLazyGetUsersListQuery } from 'src/store/services/listServices'
import { statusColors } from 'src/utils/constants'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons, { IconsEnum } from 'src/utils/icons'
import {
  Avatar,
  Box,
  Card,
  Chip,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from 'src/utils/muiElements'

const salesData: TableHeaderStatCardProps[] = [
  {
    value: '245k',
    title: 'Sales',
    color: ThemeColorEnum.Primary,
    icon: <GetChaarvyIcons iconName='AbTesting' fontSize={ChaarvyIconFontSize.lg} />
  },
  {
    value: '12.5k',
    title: 'Customers',
    color: ThemeColorEnum.Success,
    icon: <GetChaarvyIcons iconName='Abacus' fontSize={ChaarvyIconFontSize.lg} />
  },
  {
    value: '1.54k',
    color: ThemeColorEnum.Warning,
    title: 'Products',
    icon: <GetChaarvyIcons iconName='Abacus' fontSize={ChaarvyIconFontSize.lg} />
  },
  {
    value: '$88k',
    color: ThemeColorEnum.Info,
    title: 'Revenue',
    icon: <GetChaarvyIcons iconName='Abacus' fontSize={ChaarvyIconFontSize.lg} />
  }
]

const Users = () => {
  const { triggerToast } = useToast()
  const [fetchUsersList, { data: usersList }] = useLazyGetUsersListQuery()

  useEffect(() => {
    fetchUsersList()
      .unwrap()
      .catch(e => {
        triggerToast(e.data.detail, { variant: ToastVariants.ERROR })
      })
  }, [])

  const users: UsersListResponse[] = usersList || []

  const handleUpdateUserClick = (user_id: string) => {
    alert('updating user')
  }

  const handleUpdateUserPermissionsClick = (user_id: string) => {
    alert('updating user permissions')
  }

  const getDropDownOptions = (user: UsersListResponse) =>
    filterFalseAndInvalid([
      isPermitted(Permissions.UPDATE_USER) && {
        id: user.user_id,
        label: 'Update details',
        onOptionClick: () => handleUpdateUserClick(user.user_id)
      },
      isPermitted(Permissions.UPDATE_USER_PERMISSIONS) && {
        id: user.user_id,
        label: 'Update Permissions',
        onOptionClick: () => handleUpdateUserPermissionsClick(user.user_id)
      }
    ])

  const handleCreateUserClick = () => {
    alert('creating user')
  }

  const getUserTableHeader = () => {
    const props: TableTitleHeaderProps = {
      title: 'Users',
      stats: salesData,
      onButtonClick: handleCreateUserClick
    }

    if (isPermitted(Permissions.CREATE_USER)) {
      props['buttonTitle'] = 'Create User'
    }

    return props
  }

  return (
    <>
      {TableTilteHeader(getUserTableHeader())}
      <Paper>
        <Card>
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow
                    hover
                    key={user.user_id || `${user.name}-${user.email}`}
                    sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                  >
                    <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                        <Avatar />
                        <Box sx={{ flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{user.name}</Typography>
                          <Typography variant='caption'>{user.role}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.active === 1 ? 'Active' : 'Inactive'}
                        color={user.active === 1 ? statusColors.active : statusColors.inactive}
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          '& .MuiChip-label': { fontWeight: 500 }
                        }}
                      />
                    </TableCell>

                    <TableCell width='10px'>
                      <DropDownMenu dropDownMenuOptions={getDropDownOptions(user)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {users.length == 0 && (
              <Box justifyContent='center' alignItems='center' paddingBottom='2rem'>
                <Typography variant='h6' textAlign='center'>
                  No Users Available
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Card>
      </Paper>
    </>
  )
}

export default Users
