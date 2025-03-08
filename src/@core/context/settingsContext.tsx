// ** React Imports
import { PaletteMode } from '@mui/material'
import { createContext, useState, ReactNode } from 'react'

// ** MUI Imports

// ** ThemeConfig Import
import { ThemeColor, ContentWidth } from 'src/@core/layouts/types'
import themeConfig from 'src/configs/themeConfig'

// ** Types Import

export type Settings = {
  mode: PaletteMode
  themeColor: ThemeColor
  contentWidth: ContentWidth
  college_name: string
  college_code: string
  campus_name: string
  current_username?: string
  college_logo?: string
}

export type SettingsContextValue = {
  settings: Settings
  saveSettings: (updatedSettings: Settings) => void
}

const initialSettings: Settings = {
  themeColor: 'primary',
  mode: themeConfig.mode,
  contentWidth: themeConfig.contentWidth,
  college_code: '',
  college_name: '',
  campus_name: ''
}

// ** Create Context
export const SettingsContext = createContext<SettingsContextValue>({
  saveSettings: () => null,
  settings: initialSettings
})

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // ** State
  const [settings, setSettings] = useState<Settings>({ ...initialSettings })

  const saveSettings = (updatedSettings: Settings) => {
    setSettings(updatedSettings)
  }

  return <SettingsContext.Provider value={{ settings, saveSettings }}>{children}</SettingsContext.Provider>
}

export const SettingsConsumer = SettingsContext.Consumer
