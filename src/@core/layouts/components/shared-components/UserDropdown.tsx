// ** MUI Imports
import Badge from '@mui/material/Badge'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useState, SyntheticEvent, Fragment } from 'react'

import { PagePath } from 'src/constants/pagePathConstants'
import ChaarvyAvatar from 'src/reusable_components/chaarvyAvatar'
import GetChaarvyIcons from 'src/utils/icons'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  // ** Hooks
  const router = useRouter()

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url == PagePath.LOGIN_PAGE) {
      sessionStorage.clear()
    }
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <ChaarvyAvatar
          alt='John Doe'
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
          src='/images/avatars/1.png'
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem sx={{ p: 2, gap: 3 }} onClick={() => handleDropdownClose(PagePath.CHANGE_PASSWORD)}>
          <GetChaarvyIcons iconName='KeyChange' />
          Change Password
        </MenuItem>
        <MenuItem sx={{ p: 2, gap: 3 }} onClick={() => handleDropdownClose(PagePath.LOGIN_PAGE)}>
          <GetChaarvyIcons iconName='Logout' />
          Logout
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
