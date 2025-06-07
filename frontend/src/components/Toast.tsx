import { useEffect, useState } from 'react'
import { MdCheckCircle, MdClose, MdError } from 'react-icons/md'

type ToastType = 'success' | 'error'

type ToastProps = {
  message: string
  type: ToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose, message])

  if (!isVisible) return null

  const Icon = type === 'success' ? MdCheckCircle : MdError
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div
      className={`fixed top-16 right-4 ${bgColor} text-white p-4 shadow-lg z-50 flex items-center gap-3 max-w-md rounded-md`}
    >
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        <MdClose size={16} />
      </button>
    </div>
  )
}

// Hook for using toast notifications
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    isVisible: boolean
    id: number
  }>({
    message: '',
    type: 'success',
    isVisible: false,
    id: 0,
  })

  const showToast = (message: string, type: ToastType = 'success') => {
    // Generate a unique ID for this toast to ensure it replaces any existing one
    const newId = Date.now()
    setToast({ message, type, isVisible: true, id: newId })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return {
    toast,
    showToast,
    hideToast,
  }
}
