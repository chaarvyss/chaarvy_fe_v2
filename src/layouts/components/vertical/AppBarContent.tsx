import { Theme } from '@mui/material/styles'

import { Settings } from 'src/@core/context/settingsContext'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import { MenuIcon, MagnifyIcon } from 'src/utils/mdiElements'
import { useMediaQuery, Box, IconButton, TextField, InputAdornment } from 'src/utils/muiElements'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const hiddenSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <Box sx={{ position: 'fixed', top: '10px', width: hiddenSm ? '92%' : '79%' }}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
          {hidden ? (
            <IconButton
              color='inherit'
              onClick={toggleNavVisibility}
              sx={{ ml: -2.75, ...(hiddenSm ? {} : { mr: 3.5 }) }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
        </Box>
        <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
          <ModeToggler settings={settings} saveSettings={saveSettings} />
          {/* <NotificationDropdown /> */}
          <UserDropdown />
        </Box>
      </Box>
    </Box>
  )
}

export default AppBarContent
