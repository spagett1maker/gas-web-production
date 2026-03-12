import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const NAVER_ACCESS_KEY = Deno.env.get('NAVER_ACCESS_KEY')!
const NAVER_SECRET_KEY = Deno.env.get('NAVER_SECRET_KEY')!
const NAVER_SENS_SERVICE_ID = Deno.env.get('NAVER_SENS_SERVICE_ID')!
const NAVER_CALLING_NUMBER = Deno.env.get('NAVER_CALLING_NUMBER')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function makeSignature(method: string, uri: string, timestamp: string): Promise<string> {
  const message = `${method} ${uri}\n${timestamp}\n${NAVER_ACCESS_KEY}`
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(NAVER_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

function toLocalPhone(phone: string): string {
  if (phone.startsWith('+82')) {
    return '0' + phone.slice(3)
  }
  return phone
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

    const { user_id, service_name, status } = await req.json()

    if (!user_id || !service_name || !status) {
      return new Response(
        JSON.stringify({ error: 'user_id, service_name, status가 필요합니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const message = getMessageContent(service_name, status)
    if (!message) {
      return new Response(
        JSON.stringify({ error: '지원하지 않는 상태입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Service role client로 유저 전화번호 조회
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('phone')
      .eq('id', user_id)
      .single()

    if (profileError || !profile?.phone) {
      console.error('유저 전화번호 조회 실패:', profileError)
      return new Response(
        JSON.stringify({ error: '유저 전화번호를 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const localPhone = toLocalPhone(profile.phone)
    const uri = `/sms/v2/services/${NAVER_SENS_SERVICE_ID}/messages`
    const timestamp = Date.now().toString()
    const signature = await makeSignature('POST', uri, timestamp)

    const response = await fetch(`https://sens.apigw.ntruss.com${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': NAVER_ACCESS_KEY,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: JSON.stringify({
        type: 'SMS',
        from: NAVER_CALLING_NUMBER,
        content: message,
        messages: [{ to: localPhone }],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('SENS API 오류:', response.status, errorBody)
      return new Response(
        JSON.stringify({ error: 'SMS 발송 실패' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const result = await response.json()
    console.log('알림 SMS 발송 성공:', result.requestId, `→ ${localPhone}`)

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
