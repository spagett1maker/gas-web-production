import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

export async function sendTestNotification() {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('[LocalNotif] Not native platform, skipping')
      return
    }

    console.log('[LocalNotif] Checking permissions...')
    const permStatus = await LocalNotifications.checkPermissions()
    console.log('[LocalNotif] Permission status:', permStatus.display)

    if (permStatus.display !== 'granted') {
      console.log('[LocalNotif] Requesting permissions...')
      const reqResult = await LocalNotifications.requestPermissions()
      console.log('[LocalNotif] Request result:', reqResult.display)
      if (reqResult.display !== 'granted') {
        console.log('[LocalNotif] Permission denied')
        return
      }
    }

    const notifId = Math.floor(Math.random() * 100000)
    console.log('[LocalNotif] Scheduling notification id:', notifId)

    const result = await LocalNotifications.schedule({
      notifications: [
        {
          title: '우리동네가스',
          body: '요청하신 화구 교체 서비스가 접수되었습니다. 기사님이 곧 방문 예정입니다.',
          id: notifId,
          schedule: { at: new Date(Date.now() + 3000) },
          sound: 'default',
        },
      ],
    })

    console.log('[LocalNotif] Scheduled result:', JSON.stringify(result))
  } catch (err) {
    console.error('[LocalNotif] Error:', err)
  }
}
