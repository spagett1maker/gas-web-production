import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'

const STATUS_MESSAGES: Record<string, { title: string; message: (serviceName: string) => string }> = {
  진행중: {
    title: '서비스 요청이 수락되었습니다',
    message: (serviceName) => `${serviceName} 요청이 수락되어 작업이 시작됩니다.`,
  },
  완료: {
    title: '서비스가 완료되었습니다',
    message: (serviceName) => `${serviceName}가 성공적으로 완료되었습니다.`,
  },
  취소: {
    title: '서비스 요청이 취소되었습니다',
    message: (serviceName) => `${serviceName} 요청이 취소되었습니다. 자세한 내용은 고객센터로 문의해주세요.`,
  },
}

// 관리자가 서비스 상태를 변경한 뒤 사용자에게 앱 알림 + SMS 발송
// (실패해도 상태 변경은 유지되므로 에러는 로그만 남김)
export async function notifyServiceStatusChange(requestId: string, serviceKey: string | undefined, newStatus: string) {
  const { data: requestData } = await supabase
    .from('service_requests')
    .select('user_id')
    .eq('id', requestId)
    .single()

  if (!requestData?.user_id) return

  const serviceName = SERVICE_NAME_MAP[serviceKey ?? ''] || '서비스'
  const content = STATUS_MESSAGES[newStatus]

  const { error: notificationError } = await supabase.from('notifications').insert([
    {
      user_id: requestData.user_id,
      type: 'service',
      title: content?.title ?? '서비스 상태가 변경되었습니다',
      message: content ? content.message(serviceName) : `서비스 상태가 [${newStatus}]로 변경되었습니다.`,
      read: false,
    },
  ])

  if (notificationError) {
    console.error('알림 생성 실패:', notificationError)
  }

  // 수신자/문구는 Edge Function 이 DB 에서 직접 조회
  supabase.functions
    .invoke('send-notification-sms', { body: { request_id: requestId } })
    .then(({ error: smsError }) => {
      if (smsError) {
        console.error('SMS 발송 실패:', smsError)
      }
    })
}
