// ** React Imports

// ** MUI Imports
import MuiAppBar, { AppBarProps } from '@mui/material/AppBar'
import { styled } from '@mui/material/styles'
import MuiToolbar, { ToolbarProps } from '@mui/material/Toolbar'
import { ReactNode } from 'react'

// ** Type Import

interface Props {
  verticalAppBarContent?: (props?: any) => ReactNode
  // eslint-disable-next-line react/no-unused-prop-types
  toggleNavVisibility: () => void
}

const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme }) => ({
  transition: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0, 6),
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  minHeight: theme.mixins.toolbar.minHeight,
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const Toolbar = styled(MuiToolbar)<ToolbarProps>(({ theme }) => ({
  width: '100%',
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  padding: `${theme.spacing(0)} !important`,
  minHeight: `${theme.mixins.toolbar.minHeight}px !important`,
  transition:
    'padding .25s ease-in-out, box-shadow .25s ease-in-out, backdrop-filter .25s ease-in-out, background-color .25s ease-in-out'
}))

const LayoutAppBar = (props: Props) => {
  // ** Props
  const { verticalAppBarContent: userVerticalAppBarContent } = props

  return (
    <AppBar elevation={0} color='default' className='layout-navbar' position='static'>
      <Toolbar className='navbar-content-container'>
        {(userVerticalAppBarContent && userVerticalAppBarContent(props)) || null}
      </Toolbar>
    </AppBar>
  )
}

export default LayoutAppBar
