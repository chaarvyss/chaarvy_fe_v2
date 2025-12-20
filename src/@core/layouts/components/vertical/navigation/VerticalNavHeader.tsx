import Box, { BoxProps } from '@mui/material/Box'
import { deepOrange } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'

import { Avatar } from '@muiElements'
import { Settings } from 'src/@core/context/settingsContext'
import { getInitials } from 'src/utils/helpers'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
  verticalNavMenuBranding?: (props?: any) => ReactNode
}

// ** Styled Components
const MenuHeaderWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingRight: theme.spacing(4.5),
  transition: 'padding .25s ease-in-out',
  minHeight: theme.mixins.toolbar.minHeight
}))

const VerticalNavHeader = (props: Props) => {
  // ** Props
  const {
    verticalNavMenuBranding: userVerticalNavMenuBranding,
    settings,
    hidden,
    toggleNavVisibility,
    saveSettings
  } = props

  // todo: need to use below props as well

  console.log({ hidden, toggleNavVisibility, saveSettings })

  return (
    <MenuHeaderWrapper className='nav-header' sx={{ pl: 0 }}>
      {userVerticalNavMenuBranding ? (
        userVerticalNavMenuBranding(props)
      ) : (
        <Box display='flex' justifyContent='center' alignItems='start'>
          <Box margin='1rem 0rem' marginLeft='.5rem'>
            <Avatar src={settings.college_logo} sx={{ bgcolor: deepOrange[500] }} alt={settings.college_name}>
              {getInitials(settings.college_name)}
            </Avatar>
          </Box>
          <Box display='flex' flexDirection='column' justifyContent='start' margin='1rem 0rem'>
            <Typography
              variant='h6'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: 200,
                ml: 3
              }}
              noWrap
            >
              {settings.college_name}
            </Typography>
            <Typography variant='body1' sx={{ ml: 3 }}>
              {settings.campus_name}
            </Typography>
          </Box>
        </Box>
      )}
    </MenuHeaderWrapper>
  )
}

export default VerticalNavHeader
