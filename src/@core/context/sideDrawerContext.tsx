import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SideDrawerContextProps {
  isOpen: boolean
  title: string
  children: ReactNode
  className?: string
  openDrawer: (title: string, children?: ReactNode, className?: string) => void
  closeDrawer: () => void
  setChildren: (content: ReactNode) => void
}

const SideDrawerContext = createContext<SideDrawerContextProps | undefined>(undefined)

export const SideDrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [drawerChildren, setDrawerChildren] = useState<ReactNode>(null)
  const [className, setClassName] = useState<string>()

  const openDrawer = (drawerTitle: string, content?: ReactNode, className?: string) => {
    setTitle(drawerTitle)
    if (content) setDrawerChildren(content)
    if (className) setClassName(className)
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
        setChildren: setDrawerChildren
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
