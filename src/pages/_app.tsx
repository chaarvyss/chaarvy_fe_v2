// ** Next Imports
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Router } from 'next/router'
import NProgress from 'nprogress'
import { Provider } from 'react-redux'

import type { NextPage } from 'next'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'
import themeConfig from 'src/configs/themeConfig'
import UserLayout from 'src/layouts/UserLayout'
import 'react-perfect-scrollbar/dist/css/styles.css'
import '../../styles/globals.css'
import store from 'src/store'
import { ToastProvider } from 'src/@core/context/toastContext'
import { ToastContainer } from 'react-toastify'

type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  return (
    <ToastProvider>
      <Provider store={store}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title>
            <meta
              name='description'
              content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
            />
            <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
            <meta name='viewport' content='initial-scale=1, width=device-width' />
          </Head>

          <SettingsProvider>
            <SettingsConsumer>
              {({ settings }) => {
                return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>
              }}
            </SettingsConsumer>
            <ToastContainer />
          </SettingsProvider>
        </CacheProvider>
      </Provider>
    </ToastProvider>
  )
}

export default App
