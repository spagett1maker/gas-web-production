// Supabase Edge Function - Solapi SMS 발송
// Supabase Auth "Send SMS" Hook으로 연결하여 사용

const SOLAPI_API_KEY = Deno.env.get('SOLAPI_API_KEY')!
const SOLAPI_API_SECRET = Deno.env.get('SOLAPI_API_SECRET')!
const SOLAPI_CALLING_NUMBER = Deno.env.get('SOLAPI_CALLING_NUMBER')!

// Solapi HMAC-SHA256 서명 생성
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

// 랜덤 salt 생성
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

// 전화번호 정규화: 다양한 형식 → 01012345678
function normalizePhone(phone: string): string {
  // 숫자만 추출
  const digits = phone.replace(/[^0-9]/g, '')
  // 82로 시작하면 국가코드 제거 후 0 붙임 (821012345678 → 01012345678)
  if (digits.startsWith('82') && digits.length >= 11) {
    return '0' + digits.slice(2)
  }
  // 이미 0으로 시작하면 그대로
  if (digits.startsWith('0')) {
    return digits
  }
  return digits
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()

    // Supabase Auth Hook 형식: { user: { phone }, sms: { otp } }
    const phone = payload.user?.phone
    const otp = payload.sms?.otp

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'phone 또는 otp가 누락되었습니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const localPhone = normalizePhone(phone)
    const fromNumber = normalizePhone(SOLAPI_CALLING_NUMBER)
    console.log('발송 대상:', localPhone, '발신번호:', fromNumber)
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
          text: `[우리동네가스] 인증번호 [${otp}]를 입력해주세요.`,
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
    console.log('SMS 발송 성공:', result)

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
