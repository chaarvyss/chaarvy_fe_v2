// ** React Import
import Box, { BoxProps } from '@mui/material/Box'
import List from '@mui/material/List'
import { styled, useTheme } from '@mui/material/styles'
import { ReactNode, useRef, useState } from 'react'

// ** MUI Import

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'
import { VerticalNavItemsType } from 'src/@core/layouts/types'

// ** Component Imports
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

import Drawer from './Drawer'
import VerticalNavHeader from './VerticalNavHeader'
import VerticalNavItems from './VerticalNavItems'
import { purple } from '@mui/material/colors'

// ** Util Import

interface Props {
  hidden: boolean
  navWidth: number
  settings: Settings
  children: ReactNode
  navVisible: boolean
  toggleNavVisibility: () => void
  setNavVisible: (value: boolean) => void
  verticalNavItems?: VerticalNavItemsType
  saveSettings: (values: Settings) => void
  verticalNavMenuContent?: (props?: any) => ReactNode
  afterVerticalNavMenuContent?: (props?: any) => ReactNode
  beforeVerticalNavMenuContent?: (props?: any) => ReactNode
}

const StyledBoxForShadow = styled(Box)<BoxProps>({
  top: 50,
  left: -8,
  zIndex: 2,
  height: 75,
  display: 'none',
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  '&.d-block': {
    display: 'block'
  }
})

const Navigation = (props: Props) => {
  // ** Props
  const { afterVerticalNavMenuContent, settings, verticalNavMenuContent: userVerticalNavMenuContent } = props

  // ** States
  const [groupActive, setGroupActive] = useState<string[]>([])
  const [currentActiveGroup, setCurrentActiveGroup] = useState<string[]>([])

  // ** Ref
  const shadowRef = useRef(null)

  // ** Hooks
  const theme = useTheme()

  return (
    <Drawer {...props}>
      <Box bgcolor={settings.mode == 'light' ? purple[50] : 'black'}>
        <VerticalNavHeader {...props} />
        <StyledBoxForShadow
          ref={shadowRef}
          sx={{
            background: `linear-gradient(${theme.palette.background.default} 40%,${hexToRGBA(
              theme.palette.background.default,
              0.1
            )} 95%,${hexToRGBA(theme.palette.background.default, 0.05)})`
          }}
        />
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {userVerticalNavMenuContent ? (
              userVerticalNavMenuContent(props)
            ) : (
              <Box className='nav-items' sx={{ transition: 'padding .25s ease', pr: 4.5 }}>
                <VerticalNavItems
                  groupActive={groupActive}
                  setGroupActive={setGroupActive}
                  currentActiveGroup={currentActiveGroup}
                  setCurrentActiveGroup={setCurrentActiveGroup}
                  {...props}
                />
              </Box>
            )}
          </Box>
        </Box>
        {afterVerticalNavMenuContent ? afterVerticalNavMenuContent(props) : null}
      </Box>
    </Drawer>
  )
}

export default Navigation
