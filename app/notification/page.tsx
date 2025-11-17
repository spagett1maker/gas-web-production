'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { formatRelativeDate, formatTime } from '@/utils/format'

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('알림 로드 실패:', error)
    } else {
      setNotifications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setAuthLoading(false)
      await fetchNotifications()
    }

    checkAuth()
  }, [router])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return '🔔'
      case 'inquiry':
        return '💬'
      case 'system':
        return '⚙️'
      default:
        return '📌'
    }
  }

  if (authLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg
            className="w-7 h-7 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold text-gray-800">알림</h1>
        <div className="w-7" />
      </header>

      {/* 알림 리스트 */}
      {loading ? (
        <Loading />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-base">알림이 없습니다.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-5 py-4 ${
                notification.read ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-3">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRelativeDate(notification.created_at)} •{' '}
                    {formatTime(notification.created_at)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
