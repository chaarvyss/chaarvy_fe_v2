import React, { createContext, useContext, useState, ReactNode } from 'react'

interface OpenDrawerParams {
  title: string
  content?: ReactNode
  className?: string
  size?: 'small' | 'medium' | 'large'
}

interface SideDrawerContextProps {
  isOpen: boolean
  title: string
  children: ReactNode
  className?: string
  size?: 'small' | 'medium' | 'large'
  openDrawer: (params: OpenDrawerParams) => void
  closeDrawer: () => void
  setChildren: (content: ReactNode) => void
}

const SideDrawerContext = createContext<SideDrawerContextProps | undefined>(undefined)

export const SideDrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [drawerChildren, setDrawerChildren] = useState<ReactNode>(null)
  const [className, setClassName] = useState<string>()
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('small')

  const openDrawer = ({ title, content, className, size }: OpenDrawerParams) => {
    setTitle(title)
    if (content) setDrawerChildren(content)
    if (className) setClassName(className)
    setSize(size ?? 'small')
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setTitle('')
    setDrawerChildren(null)
    setClassName(undefined)
  }

  return (
    <SideDrawerContext.Provider
      value={{
        isOpen,
        title,
        children: drawerChildren,
        openDrawer,
        className,
        closeDrawer,
        setChildren: setDrawerChildren,
        size
      }}
    >
      {children}
    </SideDrawerContext.Provider>
  )
}

export const useSideDrawer = () => {
  const context = useContext(SideDrawerContext)
  if (!context) {
    throw new Error('useSideDrawer must be used within a SideDrawerProvider')
  }

  return context
}
