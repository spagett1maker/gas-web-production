import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from '@/lib/supabase'

/**
 * 네이티브 환경인지 확인
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * 현재 알림 권한 상태 확인
 * - 'prompt': 아직 물어보지 않음
 * - 'granted': 허용됨
 * - 'denied': 거부됨
 */
export async function checkNotificationPermission(): Promise<'prompt' | 'granted' | 'denied'> {
  if (isNative()) {
    const result = await PushNotifications.checkPermissions()
    if (result.receive === 'granted') return 'granted'
    if (result.receive === 'denied') return 'denied'
    return 'prompt'
  }

  // 웹 환경
  if (typeof Notification !== 'undefined') {
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'
  }
  return 'prompt'
}

/**
 * 알림 권한 요청 + 등록
 * @returns granted 여부
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isNative()) {
    const permission = await PushNotifications.requestPermissions()
    if (permission.receive === 'granted') {
      await registerPushNotifications()
      return true
    }
    return false
  }

  // 웹 환경 폴백
  if (typeof Notification !== 'undefined') {
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  return false
}

/**
 * 푸시 알림 등록 + 이벤트 리스너 설정
 */
async function registerPushNotifications() {
  // 토큰 수신
  await PushNotifications.addListener('registration', async (token) => {
    console.log('[Push] Token:', token.value)
    await savePushToken(token.value)
  })

  // 등록 에러
  await PushNotifications.addListener('registrationError', (error) => {
    console.error('[Push] Registration error:', error)
  })

  // 포그라운드 알림 수신
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[Push] Received in foreground:', notification)
  })

  // 알림 클릭
  await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('[Push] Action performed:', action)
    const data = action.notification.data
    if (data?.url) {
      window.location.href = data.url
    }
  })

  await PushNotifications.register()
}

/**
 * Supabase에 푸시 토큰 저장
 */
async function savePushToken(token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', user.id)
  } catch (error) {
    console.warn('[Push] Failed to save token:', error)
  }
}

/**
 * iOS 설정 앱의 알림 설정으로 이동
 */
export function openNotificationSettings() {
  if (isNative()) {
    // iOS: 앱 설정 페이지로 이동
    // Capacitor는 app-settings: URL scheme을 지원
    window.open('app-settings:', '_system')
  }
}
