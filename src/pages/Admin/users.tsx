import { useEffect, useState } from 'react'

import { Box, Chip, Typography } from '@muiElements'
import { useLoader } from 'src/@core/context/loaderContext'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { TableHeaderStatCardProps, User } from 'src/lib/interfaces'
import ChaarvyAvatar from 'src/reusable_components/chaarvyAvatar'
import { useUpdateUserStatusMutation } from 'src/store/services/adminServices'
import { useLazyGetUsersListQuery } from 'src/store/services/listServices'
import { statusColors } from 'src/utils/constants'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons from 'src/utils/icons'
import CreateUser from 'src/views/Users/createUsers'
import ViewUserProfile from 'src/views/Users/userProfile'

const Users = () => {
  const { triggerToast } = useToast()
  const [fetchUsersList, { data: usersList, isFetching: isFetchingUsers }] = useLazyGetUsersListQuery()
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
    openDrawer({ title: 'New User', content: <CreateUser /> })
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
    openDrawer({
      title: 'Filters',
      content: (
        <RenderFilterOptions onSubmit={onSubmit} fields={['search', 'status', 'role']} statusOptions={statusOptions} />
      )
    })
  }

  const isLoading = isStatusUpdating || isFetchingUsers

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading])

  const handleViewUserProfileModalClose = () => {
    setSelectedUser(undefined)
  }

  const columns = [
    {
      id: '',
      label: 'Name',
      render: (row: any) => {
        return (
          <Box
            sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}
            onClick={event => {
              event.stopPropagation()
              setSelectedUser(row)
            }}
          >
            <Box>
              <ChaarvyAvatar src={row.profile_pic} alt={row.name} />
            </Box>
            <Box sx={{ flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.name}</Typography>
              <Typography variant='caption'>{row.mobile}</Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      id: 'role_name',
      label: 'Role'
    },
    {
      id: 'email',
      label: 'Email',
      width: 250
    },
    {
      id: 'status',
      label: 'Status',
      render: (row: any) => {
        return (
          <Chip
            onClick={event => {
              event.stopPropagation()
              updateUserStatus(row.user_id)
            }}
            label={row.status == '1' ? 'Active' : 'Inactive'}
            color={row.status == '1' ? statusColors.active : statusColors.inactive}
            sx={{
              height: 24,
              fontSize: '0.75rem',
              textTransform: 'capitalize',
              '& .MuiChip-label': { fontWeight: 500 }
            }}
          />
        )
      }
    }
  ]

  return (
    <>
      {selectedUser && <ViewUserProfile user_id={selectedUser?.user_id} onClose={handleViewUserProfileModalClose} />}
      <ChaarvyTable
        tableTitleHeaderProps={{
          title: 'Users',
          stats: usersData,
          onButtonClick: handleCreateUserClick,
          showFilterIcon: true,
          iconName: 'AccountPlusOutline',
          buttonTitle: 'Create User',
          handleFilterButtonClick: onFilterButtonClick
        }}
        tableDataProps={{
          data: usersList?.users ?? [],
          columns: columns,
          getRowKey: row => row.user_id,
          isLoading: isFetchingUsers,
          loadingText: 'Loading Users...'
        }}
        paginationProps={{
          total: usersList?.counts?.filtered ?? 0,
          onChange: props => setFilters({ ...filters, ...props })
        }}
      />
    </>
  )
}

export default Users
