'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  title?: string
  message: string
  type?: 'service' | 'inquiry' | 'system' | 'default' | 'success' | 'error'
  duration?: number
  onClose: () => void
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'service':
      return '🔔'
    case 'inquiry':
      return '💬'
    case 'system':
      return '⚙️'
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    default:
      return '📌'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50'
    case 'error':
      return 'border-red-200 bg-red-50'
    default:
      return 'border-gray-200 bg-white'
  }
}

export function Toast({ title, message, type = 'default', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm w-full rounded-xl shadow-lg border p-4 z-50 transition-all duration-300 ${
        getTypeColor(type)
      } ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      onClick={handleClose}
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3 flex-shrink-0">{getTypeIcon(type)}</div>
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-[15px] font-bold text-gray-800 mb-1 truncate">{title}</h3>}
          <p className="text-[13px] text-gray-600 line-clamp-2">{message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    title?: string
    message: string
    type?: 'service' | 'inquiry' | 'system' | 'default' | 'success' | 'error'
  }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 p-4 z-50 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * 10}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <Toast
              title={toast.title}
              message={toast.message}
              type={toast.type}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
