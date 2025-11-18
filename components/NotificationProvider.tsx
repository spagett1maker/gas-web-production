'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ToastContainer } from '@/components/ui/Toast'

interface ToastNotification {
  id: string
  title: string
  message: string
  type?: 'service' | 'inquiry' | 'system' | 'default'
}

export default function NotificationProvider() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()

  // 관리자 페이지인지 확인
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    const initUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
      }
    }

    initUser()
  }, [])

  useEffect(() => {
    if (!userId || isAdminPage) {
      // 관리자 페이지에서는 알림을 표시하지 않음
      return
    }

    // Supabase Realtime 구독 설정
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as any

          // 새 알림이 들어오면 토스트로 표시
          const newToast: ToastNotification = {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type || 'default',
          }

          setToasts((prev) => [...prev, newToast])

          // 알림 소리 재생 (선택사항)
          playNotificationSound()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, isAdminPage])

  const playNotificationSound = () => {
    // 간단한 알림음 재생 (브라우저 기본 소리)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVqzn77BdGAg+lt7xwmwkBTKAy/PVgysFIm/A7uSbSA0NUqnk8LljGgg8kNv0xnMnBSx+yPHYhzUGHWu86+SZRAwRUqjl8Lph==')
      audio.volume = 0.3
      audio.play().catch(() => {
        // 소리 재생 실패 시 무시
      })
    } catch (error) {
      // 에러 무시
    }
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return <ToastContainer toasts={toasts} onRemove={removeToast} />
}
