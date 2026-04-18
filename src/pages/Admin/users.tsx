import { useEffect, useState } from 'react'

import { useLoader } from 'src/@core/context/loaderContext'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import RenderFilterOptions from 'src/common/filters'
import { FilterProps, TableHeaderStatCardProps, User } from 'src/lib/interfaces'
import ChaarvyAvatar from 'src/reusable_components/chaarvyAvatar'
import ChaarvyPagination from 'src/reusable_components/Pagination'
import TableTilteHeader, { TableTitleHeaderProps } from 'src/reusable_components/Table/TableTilteHeader'
import { useUpdateUserStatusMutation } from 'src/store/services/adminServices'
import { useLazyGetUsersListQuery } from 'src/store/services/listServices'
import { statusColors } from 'src/utils/constants'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons from 'src/utils/icons'
import {
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
import CreateUser from 'src/views/Users/createUsers'
import ViewUserProfile from 'src/views/Users/userProfile'

const Users = () => {
  const { triggerToast } = useToast()
  const [fetchUsersList, { data: usersList, isLoading: isFetchingUsers }] = useLazyGetUsersListQuery()
  const [updateUserStatus, { isLoading: isStatusUpdating }] = useUpdateUserStatusMutation()
  const { setLoading } = useLoader()

  const [selectedUser, setSelectedUser] = useState<User>()

  const { openDrawer } = useSideDrawer()

  const [filters, setFilters] = useState<FilterProps>({ limit: 20, offset: 0, status_: '1' })

  const usersData: TableHeaderStatCardProps[] = [
    {
      value: usersList?.counts?.total ?? 0,
      title: 'Total Users',
      color: ThemeColorEnum.Primary,
      icon: <GetChaarvyIcons iconName='Group' fontSize={ChaarvyIconFontSize.lg} />
    },
    {
      value: usersList?.counts?.filtered ?? 0,
      title: 'Filtered Users',
      color: ThemeColorEnum.Success,
      icon: <GetChaarvyIcons iconName='Abacus' fontSize={ChaarvyIconFontSize.lg} />
    }
  ]

  useEffect(() => {
    fetchUsersList(filters)
      .unwrap()
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }, [filters])

  const handleCreateUserClick = () => {
    openDrawer('New User', <CreateUser />)
  }

  const onSubmit = (params?: FilterProps) => {
    fetchUsersList({ ...filters, ...params })
  }

  const statusOptions = [
    {
      label: 'Active',
      value: '1'
    },
    {
      label: 'Inactive',
      value: '0'
    }
  ]

  const onFilterButtonClick = () => {
    openDrawer(
      'Filters',
      <RenderFilterOptions onSubmit={onSubmit} fields={['search', 'status', 'role']} statusOptions={statusOptions} />
    )
  }

  const getUserTableHeader = () => {
    const props: TableTitleHeaderProps = {
      title: 'Users',
      stats: usersData,
      onButtonClick: handleCreateUserClick,
      showFilterIcon: true,
      icon: <GetChaarvyIcons iconName='AccountPlusOutline' />,
      buttonTitle: 'Create User',
      handleFilterButtonClick: onFilterButtonClick
    }

    return props
  }

  const isLoading = isStatusUpdating || isFetchingUsers

  setLoading(isLoading)

  const handleViewUserProfileModalClose = () => {
    setSelectedUser(undefined)
  }

  return (
    <>
      {selectedUser && <ViewUserProfile user_id={selectedUser?.user_id} onClose={handleViewUserProfileModalClose} />}
      {TableTilteHeader(getUserTableHeader())}
      <Paper>
        <Card>
          <TableContainer>
            <Table aria-label='table in dashboard'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(usersList?.users ?? []).map(user => (
                  <TableRow
                    hover
                    key={user.user_id || `${user.name}-${user.email}`}
                    sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell sx={{ py: theme => `${theme.spacing(0.5)} !important` }}>
                      <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                        <Box onClick={event => event.stopPropagation()}>
                          <ChaarvyAvatar src={user.profile_pic} alt={user.name} />
                        </Box>
                        <Box sx={{ flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{user.name}</Typography>
                          <Typography variant='caption'>{user.mobile}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.role_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        onClick={event => {
                          event.stopPropagation()
                          updateUserStatus(user.user_id)
                        }}
                        label={user.status == '1' ? 'Active' : 'Inactive'}
                        color={user.status == '1' ? statusColors.active : statusColors.inactive}
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          '& .MuiChip-label': { fontWeight: 500 }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(usersList?.users ?? []).length == 0 && (
              <Box justifyContent='center' alignItems='center' paddingBottom='2rem'>
                <Typography variant='h6' textAlign='center'>
                  No Users Available
                </Typography>
              </Box>
            )}
          </TableContainer>
          <ChaarvyPagination
            total={usersList?.counts?.filtered ?? 0}
            onChange={props => setFilters({ ...filters, ...props })}
          />
        </Card>
      </Paper>
    </>
  )
}

export default Users
