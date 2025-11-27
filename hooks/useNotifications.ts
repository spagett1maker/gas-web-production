'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    // 브라우저가 알림을 지원하는지 확인
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  // Service Worker 등록
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker 등록 성공:', registration)
      setIsRegistered(true)
      return registration
    } catch (error) {
      console.error('Service Worker 등록 실패:', error)
      return null
    }
  }

  // 알림 권한 요청
  const requestPermission = async () => {
    if (!isSupported) {
      alert('이 브라우저는 알림을 지원하지 않습니다.')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        await registerServiceWorker()
        return true
      } else {
        alert('알림 권한이 거부되었습니다.')
        return false
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      return false
    }
  }

  // 알림 표시
  const showNotification = async (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('알림 권한이 없습니다.')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        requireInteraction: true,
        ...options,
      } as NotificationOptions)
    } catch (error) {
      console.error('알림 표시 실패:', error)
    }
  }

  // 새 서비스 요청 리스닝
  const listenToServiceRequests = (onNewRequest: (payload: any) => void) => {
    const channel = supabase
      .channel('service_requests_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_requests',
        },
        (payload) => {
          console.log('새로운 서비스 요청:', payload)
          onNewRequest(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    isSupported,
    permission,
    isRegistered,
    requestPermission,
    showNotification,
    listenToServiceRequests,
  }
}
