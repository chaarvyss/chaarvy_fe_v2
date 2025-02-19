import Box from '@mui/material/Box'
import { purple, grey } from '@mui/material/colors'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'

// ** Types
import { Settings } from 'src/@core/context/settingsContext'
import { NavLink } from 'src/@core/layouts/types'
import { handleURLQueries } from 'src/@core/layouts/utils'

interface Props {
  item: NavLink
  settings: Settings
  navVisible?: boolean
  toggleNavVisibility: () => void
}

const VerticalNavLink = ({ item, settings }: Props) => {
  const router = useRouter()

  const isNavLinkActive = () => {
    if (router.pathname === item.path || handleURLQueries(router, item.path)) {
      return true
    } else {
      return false
    }
  }

  const getItemBgColor = () => {
    if (settings.mode == 'dark') {
      return isNavLinkActive() ? purple[400] : ''
    }

    return isNavLinkActive() ? purple[700] : ''
  }

  const getItemColor = () => {
    if (settings.mode == 'dark') {
      return isNavLinkActive() ? 'white' : ''
    }

    return isNavLinkActive() ? 'white' : grey.A700
  }

  return (
    <ListItem disablePadding className='nav-link' sx={{ mt: 1.5, px: '0 !important' }}>
      <Box onClick={() => router.push(item.path === undefined ? '/' : `${item.path}`)}>
        <Box
          bgcolor={getItemBgColor()}
          padding='0.6rem'
          style={{ borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem', cursor: 'pointer' }}
        >
          <Typography color={getItemColor()}>{item.title}</Typography>
        </Box>
      </Box>
    </ListItem>
  )
}

export default VerticalNavLink
