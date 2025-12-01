// ** MUI Imports
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactNode, useEffect } from 'react'

// ** Layout Imports
// !Do not remove this Layout import
import { useSettings } from 'src/@core/hooks/useSettings'
import VerticalLayout from 'src/@core/layouts/VerticalLayout'

// ** Navigation Imports

// ** Component Import
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import VerticalNavItems from 'src/navigation/vertical'
import SideDrawer from 'src/reusable_components/sideDrawer'
import { useLazyGetCollegeDetailsQuery } from 'src/store/services/viewServices'

import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import

interface Props {
  children: ReactNode
}

const UserLayout = ({ children }: Props) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const [fetchCollegeDetails] = useLazyGetCollegeDetailsQuery()

  useEffect(() => {
    fetchCollegeDetails()
      .unwrap()
      .then(collegeDetails => {
        saveSettings({
          ...settings,
          college_name: collegeDetails.college_name ?? '',
          campus_name: collegeDetails.campus_name ?? '',
          college_code: collegeDetails.college_code ?? '',
          college_logo: collegeDetails.college_logo ?? undefined
        })
      })
  }, [])

  return (
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
  )
}

export default UserLayout
