'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'announcement-bar-dismissed'

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // localStorage 확인하여 이미 닫았는지 체크
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-[#EB5A36] to-[#FF7A5C] text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center relative">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="hidden sm:inline">🎉</span>
          <span>
            <span className="font-bold">우리동네가스 앱</span>이 곧 App Store & Play Store에 출시됩니다!
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
            Coming Soon
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
