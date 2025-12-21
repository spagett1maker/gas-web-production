import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: SupabaseClient | null = null

const initSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Capacitor에서는 URL 세션 감지 비활성화
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }
  return supabaseInstance
}

// Proxy object to delay initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = initSupabase()
    return (client as any)[prop]
  }
})

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    // 서버 상태 확인
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Supabase 연결 테스트 실패:', error.message)
      return {
        success: false,
        error: error.message
      }
    }

    console.log('Supabase 연결 성공!')
    return {
      success: true,
      data: {
        connected: true,
        url: supabaseUrl
      }
    }
  } catch (err) {
    console.error('Supabase 연결 테스트 중 예외 발생:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류'
    }
  }
}
