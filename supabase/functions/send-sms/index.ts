// Supabase Edge Function - 네이버 클라우드 SENS SMS 발송
// Supabase Auth "Send SMS" Hook으로 연결하여 사용

const NAVER_ACCESS_KEY = Deno.env.get('NAVER_ACCESS_KEY')!
const NAVER_SECRET_KEY = Deno.env.get('NAVER_SECRET_KEY')!
const NAVER_SENS_SERVICE_ID = Deno.env.get('NAVER_SENS_SERVICE_ID')!
const NAVER_CALLING_NUMBER = Deno.env.get('NAVER_CALLING_NUMBER')!

// NAVER Cloud API 인증용 HMAC-SHA256 서명 생성
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

// +821012345678 → 01012345678
function toLocalPhone(phone: string): string {
  if (phone.startsWith('+82')) {
    return '0' + phone.slice(3)
  }
  return phone
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

    const localPhone = toLocalPhone(phone)
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
        content: `[우리동네가스] 인증번호 [${otp}]를 입력해주세요.`,
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
    console.log('SMS 발송 성공:', result.requestId)

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
