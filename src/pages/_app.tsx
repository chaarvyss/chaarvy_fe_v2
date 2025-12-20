import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Router } from 'next/router'
import NProgress from 'nprogress'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { PersistGate } from 'redux-persist/integration/react'

import type { NextPage } from 'next'
import { ImageViewerProvider } from 'src/@core/context/imageViewerContext'
import { LoaderProvider } from 'src/@core/context/loaderContext'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'
import { SideDrawerProvider } from 'src/@core/context/sideDrawerContext'
import { ToastProvider } from 'src/@core/context/toastContext'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'
import themeConfig from 'src/configs/themeConfig'
import UserLayout from 'src/layouts/UserLayout'
import 'react-perfect-scrollbar/dist/css/styles.css'
import '../../styles/globals.css'
import store, { persistor } from 'src/store'
import 'react-datepicker/dist/react-datepicker.css'
import 'bootstrap/dist/css/bootstrap.min.css'

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
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  // Variables

  return (
    <ToastProvider>
      <LoaderProvider>
        <ImageViewerProvider>
          <SideDrawerProvider>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <CacheProvider value={emotionCache}>
                  <Head>
                    <title>{`${themeConfig.templateName}`}</title>
                    <meta name='description' content={`${themeConfig.templateName}`} />
                    <meta name='keywords' content='Education, ERP, inter, school, Acadamics,Management,Chaarvy' />
                    <meta name='viewport' content='initial-scale=1, width=device-width' />
                  </Head>

                  <SettingsProvider>
                    <SettingsConsumer>
                      {({ settings }) => {
                        return (
                          <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>
                        )
                      }}
                    </SettingsConsumer>
                    <ToastContainer />
                  </SettingsProvider>
                </CacheProvider>
              </PersistGate>
            </Provider>
          </SideDrawerProvider>
        </ImageViewerProvider>
      </LoaderProvider>
    </ToastProvider>
  )
}

export default App
