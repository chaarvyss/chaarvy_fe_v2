import Box from '@mui/material/Box'
import { purple, grey } from '@mui/material/colors'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import ChevronRight from 'mdi-material-ui/ChevronRight'
import { useRouter } from 'next/router'

// ** Types
import { Settings } from 'src/@core/context/settingsContext'
import { NavLink } from 'src/@core/layouts/types'
import { handleURLQueries } from 'src/@core/layouts/utils'
import GetChaarvyIcons, { GetChaarvyIconsProps } from 'src/utils/icons'

interface Props {
  item: NavLink
  settings: Settings
  depth?: number
  hasChildren?: boolean
  open?: boolean
  toggleOpen?: () => void
  active?: boolean
}

const VerticalNavLink = ({
  item,
  settings,
  depth = 0,
  hasChildren = false,
  open = false,
  toggleOpen,
  active
}: Props) => {
  const router = useRouter()

  const isNavLinkActive = () => {
    if (active) {
      return true
    }

    if (item.path) {
      return router.pathname === item.path || handleURLQueries(router, item.path)
    }

    return false
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

  const handleClick = () => {
    if (hasChildren && toggleOpen) {
      toggleOpen()

      return
    }

    router.push(item.path === undefined ? '/' : `${item.path}`)
  }

  return (
    <ListItem
      disablePadding
      className='nav-link'
      sx={{
        mt: 1.5,
        px: '0 !important',
        pl: `${depth * 1.5}rem`,
        '& .MuiButtonBase-root': { minWidth: 0 }
      }}
    >
      <Box
        onClick={handleClick}
        bgcolor={getItemBgColor()}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        width='100%'
        borderRadius='1rem'
        boxShadow={isNavLinkActive() ? `0px 0px 0.3rem .3rem ${purple[100]}` : ''}
        padding='0.6rem'
        sx={{
          cursor: 'pointer',
          transition: 'background-color .2s ease, transform .2s ease',
          '&:hover': {
            backgroundColor: settings.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(103,58,183,0.08)',
            transform: 'translateX(2px)'
          }
        }}
      >
        <Box display='flex' alignItems='center' gap='1rem'>
          {item.icon && (
            <GetChaarvyIcons color={getItemColor()} iconName={item.icon as GetChaarvyIconsProps['iconName']} />
          )}
          <Typography color={getItemColor()}>{item.title}</Typography>
        </Box>
        {hasChildren ? (
          <IconButton size='small' sx={{ color: getItemColor(), p: 0.5 }}>
            {open ? <ChevronDown fontSize='small' /> : <ChevronRight fontSize='small' />}
          </IconButton>
        ) : null}
      </Box>
    </ListItem>
  )
}

export default VerticalNavLink
