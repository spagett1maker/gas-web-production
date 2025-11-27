'use client'

import { useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

interface NotificationBannerProps {
  isSupported: boolean
  permission: NotificationPermission
  onRequestPermission: () => void
}

export function NotificationBanner({
  isSupported,
  permission,
  onRequestPermission,
}: NotificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // 이미 허용했거나 거부했으면 배너 표시 안 함
  if (!isSupported || permission !== 'default' || isDismissed) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Bell className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">새로운 서비스 요청 알림 받기</p>
            <p className="text-xs text-blue-100 mt-0.5">
              브라우저를 닫아도 새 요청이 오면 알림을 받을 수 있습니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRequestPermission}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            알림 켜기
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotificationStatus({ permission }: { permission: NotificationPermission }) {
  if (permission === 'default') return null

  return (
    <div className="flex items-center gap-2 text-sm">
      {permission === 'granted' ? (
        <>
          <Bell className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">알림 활성화됨</span>
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">알림 비활성화됨</span>
        </>
      )}
    </div>
  )
}
