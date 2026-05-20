// ** React Imports
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import { styled } from '@mui/material/styles'
import ArrowUp from 'mdi-material-ui/ArrowUp'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import ScrollToTop from 'src/@core/components/scroll-to-top'
import { LayoutProps } from 'src/@core/layouts/types'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import themeConfig from 'src/configs/themeConfig'

import AppBar from './components/vertical/appBar'
import Navigation from './components/vertical/navigation'

const VerticalLayoutWrapper = styled('div')({
  height: '100%',
  display: 'flex'
})

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: theme.spacing(6),
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const VerticalLayout = (props: LayoutProps) => {
  const { settings, children, scrollToTop } = props
  const { contentWidth } = settings
  const navWidth = themeConfig.navigationSize
  const [navVisible, setNavVisible] = useState<boolean>(false)
  const toggleNavVisibility = () => setNavVisible(!navVisible)
  const router = useRouter()
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
    }
  })

  return (
    <>
      <VerticalLayoutWrapper className='layout-wrapper'>
        <Box>
          <Navigation
            navWidth={navWidth}
            navVisible={navVisible}
            setNavVisible={setNavVisible}
            toggleNavVisibility={toggleNavVisibility}
            {...props}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <AppBar toggleNavVisibility={toggleNavVisibility} {...props} />
          <Box height={'calc(100vh - 70px)'} overflow='auto'>
            <ContentWrapper
              className='layout-page-content'
              sx={{
                ...(contentWidth === 'boxed' && {
                  mx: 'auto'
                })
              }}
            >
              {children}
            </ContentWrapper>
          </Box>
          <DatePickerWrapper sx={{ zIndex: 11 }}>
            <Box id='react-datepicker-portal'></Box>
          </DatePickerWrapper>
        </Box>
      </VerticalLayoutWrapper>

      {scrollToTop ? (
        scrollToTop(props)
      ) : (
        <ScrollToTop className='mui-fixed'>
          <Fab color='primary' size='small' aria-label='scroll back to top'>
            <ArrowUp />
          </Fab>
        </ScrollToTop>
      )}
    </>
  )
}

export default VerticalLayout
