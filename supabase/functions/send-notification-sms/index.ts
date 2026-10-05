// Supabase Edge Function - Solapi 알림 SMS 발송
// 서비스 상태 변경 시 사용자에게 알림 발송

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SOLAPI_API_KEY = Deno.env.get('SOLAPI_API_KEY')!
const SOLAPI_API_SECRET = Deno.env.get('SOLAPI_API_SECRET')!
const SOLAPI_CALLING_NUMBER = Deno.env.get('SOLAPI_CALLING_NUMBER')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// 관리자 계정 ID (lib/constants.ts 의 ADMIN_USER_ID 와 동일해야 함)
const ADMIN_USER_ID = Deno.env.get('ADMIN_USER_ID') ?? 'f0887d78-02cc-4e94-a9a5-76baf8bac9f4'

// 서비스명 매핑 (lib/constants.ts 의 SERVICE_NAME_MAP 과 동일)
const SERVICE_NAME_MAP: Record<string, string> = {
  burner: '화구 교체',
  valve: '밸브 교체',
  alarm: '경보기 교체',
  clean: '버너 청소',
  gas: '가스누출 검사',
  pipe: '배관 철거',
  quote: '시공견적 문의',
  contract: '정기계약 이용권',
  center: '고객센터',
}

async function makeSignature(date: string, salt: string): Promise<string> {
  const data = date + salt
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SOLAPI_API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateSalt(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '')
  if (digits.startsWith('82') && digits.length >= 11) {
    return '0' + digits.slice(2)
  }
  if (digits.startsWith('0')) {
    return digits
  }
  return digits
}

function getMessageContent(serviceName: string, status: string): string | null {
  switch (status) {
    case '진행중':
      return `[우리동네가스] ${serviceName} 요청이 수락되어 작업이 시작됩니다.`
    case '완료':
      return `[우리동네가스] ${serviceName}가 완료되었습니다. 이용해 주셔서 감사합니다.`
    case '취소':
      return `[우리동네가스] ${serviceName} 요청이 취소되었습니다. 문의: 1844-0627`
    default:
      return null
  }
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '인증 토큰이 필요합니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 호출자가 관리자인지 확인 (anon key / 일반 사용자 토큰으로는 발송 불가)
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token)
    if (callerError || !caller || caller.id !== ADMIN_USER_ID) {
      return new Response(
        JSON.stringify({ error: '권한이 없습니다.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const { request_id } = await req.json()

    if (!request_id) {
      return new Response(
        JSON.stringify({ error: 'request_id가 필요합니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // 수신자/서비스명/상태는 요청 본문이 아니라 DB 에서 조회
    const { data: request, error: requestError } = await supabaseAdmin
      .from('service_requests')
      .select('user_id, status, services(name)')
      .eq('id', request_id)
      .single()

    if (requestError || !request?.user_id) {
      console.error('서비스 요청 조회 실패:', requestError)
      return new Response(
        JSON.stringify({ error: '서비스 요청을 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const serviceKey = (request.services as { name?: string } | null)?.name ?? ''
    const serviceName = SERVICE_NAME_MAP[serviceKey] || '서비스'

    const message = getMessageContent(serviceName, request.status)
    if (!message) {
      return new Response(
        JSON.stringify({ error: '지원하지 않는 상태입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('phone')
      .eq('id', request.user_id)
      .single()

    if (profileError || !profile?.phone) {
      console.error('유저 전화번호 조회 실패:', profileError)
      return new Response(
        JSON.stringify({ error: '유저 전화번호를 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const localPhone = normalizePhone(profile.phone)
    const fromNumber = normalizePhone(SOLAPI_CALLING_NUMBER)
    const date = new Date().toISOString()
    const salt = generateSalt()
    const signature = await makeSignature(date, salt)

    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify({
        message: {
          to: localPhone,
          from: fromNumber,
          text: message,
          type: 'SMS',
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Solapi API 오류:', response.status, errorBody)
      return new Response(
        JSON.stringify({ error: 'SMS 발송 실패' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const result = await response.json()
    console.log('알림 SMS 발송 성공:', result, `→ ${localPhone}`)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge Function 오류:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
