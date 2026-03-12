// Supabase Edge Function - Solapi 알림 SMS 발송
// 서비스 상태 변경 시 사용자에게 알림 발송

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SOLAPI_API_KEY = Deno.env.get('SOLAPI_API_KEY')!
const SOLAPI_API_SECRET = Deno.env.get('SOLAPI_API_SECRET')!
const SOLAPI_CALLING_NUMBER = Deno.env.get('SOLAPI_CALLING_NUMBER')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
          from: SOLAPI_CALLING_NUMBER,
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
