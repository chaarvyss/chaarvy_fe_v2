import { createContext, useContext, ReactNode } from 'react'
import { toast } from 'react-toastify'

export enum ToastVariants {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info'
}

interface ToastContextProps {
  triggerToast: (message: string, options?: Record<string, unknown>, variant?: ToastVariants) => void
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const triggerToast = (message: string, options: any) => {
    options['theme'] = localStorage.getItem('theme') ?? 'light'
    options['autoClose'] = 1500
    switch (options?.variant) {
      case ToastVariants.SUCCESS:
        toast.success(message, options)
        break
      case ToastVariants.ERROR:
        toast.error(message, options)
        break
      case ToastVariants.INFO:
        toast.info(message, options)
        break
      default:
        toast(message, options)
    }
  }

  return <ToastContext.Provider value={{ triggerToast }}>{children}</ToastContext.Provider>
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
