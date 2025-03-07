import { createContext, useContext, useState, ReactNode } from 'react'
import OverlaySpinner from 'src/reusable_components/overlaySpinner'

// Define Context Type
interface LoaderContextType {
  loading: boolean
  setLoading: (value: boolean) => void
}

// Create Context with default value
const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

// Provider Component
export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false)

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {loading && <OverlaySpinner />}
      {children}
    </LoaderContext.Provider>
  )
}

// Custom Hook for easier usage
export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }
  return context
}
