import { createContext, useContext, useState, ReactNode } from 'react'

import ImageViewer from 'src/reusable_components/imageViewer'

// Define Context Type
interface ImageViewerContextType {
  showImage?: string
  setShowImage?: (value: string) => void
}

// Create Context with default value
const ImageViewerContext = createContext<ImageViewerContextType | undefined>(undefined)

// Provider Component
export const ImageViewerProvider = ({ children }: { children: ReactNode }) => {
  const [showImage, setShowImage] = useState<string | undefined>(undefined)

  return (
    <ImageViewerContext.Provider value={{ showImage, setShowImage }}>
      {showImage && showImage !== '' && <ImageViewer imageUrl={showImage} />}
      {children}
    </ImageViewerContext.Provider>
  )
}

// Custom Hook for easier usage
export const useImageViewer = (): ImageViewerContextType => {
  const context = useContext(ImageViewerContext)
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }

  return context
}
