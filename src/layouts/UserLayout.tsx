// ** React Imports
import Box from '@mui/material/Box'

// ** MUI Imports
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { CSSProperties, ReactNode, useState } from 'react'

// ** Layout Imports
// !Do not remove this Layout import
import { useSettings } from 'src/@core/hooks/useSettings'
import VerticalLayout from 'src/@core/layouts/VerticalLayout'

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical'

// ** Component Import
import VerticalAppBarContent from './components/vertical/AppBarContent'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { ClipLoader } from 'react-spinners'
import OverlaySpinner from 'src/reusable_components/overlaySpinner'
import SideDrawer from 'src/reusable_components/sideDrawer'

// ** Hook Import

interface Props {
  children: ReactNode
}

const UserLayout = ({ children }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))

  return (
    <>
      <VerticalLayout
        hidden={hidden}
        settings={settings}
        saveSettings={saveSettings}
        verticalNavItems={VerticalNavItems()}
        verticalAppBarContent={props => (
          <VerticalAppBarContent
            hidden={hidden}
            settings={settings}
            saveSettings={saveSettings}
            toggleNavVisibility={props.toggleNavVisibility}
          />
        )}
      >
        <SideDrawer />
        <DatePickerWrapper>{children}</DatePickerWrapper>
      </VerticalLayout>
    </>
  )
}

export default UserLayout
