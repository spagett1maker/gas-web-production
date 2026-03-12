'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toInternational } from '@/utils/format'
import { Loading } from '@/components/ui/Loading'
import { ArrowLeft, ChevronRight } from 'lucide-react'

const ADMIN_EMAIL = 'GAS@gas.com'

// App Store 심사용 데모 계정 설정
const DEMO_PHONE = process.env.NEXT_PUBLIC_DEMO_PHONE || '01000000000'
const DEMO_OTP = process.env.NEXT_PUBLIC_DEMO_OTP || '123456'
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'appreview.demo@gmail.com'
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Demo123456!'

export default function LoginPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAdminFlow, setIsAdminFlow] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleInputChange = (text: string) => {
    setPhoneOrEmail(text)
    setIsAdminFlow(false)
    setOtpSent(false)
    setCode('')
    setPassword('')
    setError('')
  }

  const handleSendOtpOrPassword = async () => {
    if (!phoneOrEmail) {
      setError('전화번호를 입력하세요.')
      return
    }

    // 데모 모드: API 호출 없이 바로 OTP 입력 단계로
    if (isDemoMode) {
      if (phoneOrEmail.includes('@')) {
        setIsAdminFlow(true)
      }
      setOtpSent(true)
      return
    }

    if (phoneOrEmail.includes('@')) {
      setIsAdminFlow(true)
      setOtpSent(true)
      return
    }

    const internationalPhone = toInternational(phoneOrEmail)
    const inputPhoneNormalized = phoneOrEmail.replace(/-/g, '')

    if (inputPhoneNormalized === DEMO_PHONE && DEMO_EMAIL && DEMO_PASSWORD) {
      setOtpSent(true)
      return
    }

    setLoading(true)

    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', internationalPhone)

      if (checkError) {
        setLoading(false)
        setError('전화번호 확인 중 오류가 발생했습니다.')
        return
      }

      if (!existingUsers || existingUsers.length === 0) {
        setLoading(false)
        setError('등록되지 않은 전화번호입니다.\n회원가입을 먼저 진행해주세요.')
        return
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: internationalPhone
      })

      setLoading(false)

      if (otpError) {
        setError(otpError.message)
      } else {
        setOtpSent(true)
      }
    } catch (err) {
      console.error('Login check error:', err)
      setLoading(false)
      setError('로그인 처리 중 오류가 발생했습니다.')
    }
  }

  const handleLogin = async () => {
    // 데모 모드: API 호출 없이 바로 홈으로 이동
    if (isDemoMode) {
      if (isAdminFlow) {
        if (!password) { setError('비밀번호를 입력하세요.'); return }
      } else {
        if (!code) { setError('인증번호를 입력하세요.'); return }
      }
      localStorage.setItem('demo_mode', 'true')
      router.replace('/home')
      return
    }

    // 실제 로그인 시 데모 모드 해제
    localStorage.removeItem('demo_mode')

    if (isAdminFlow) {
      if (!password) {
        setError('비밀번호를 입력하세요.')
        return
      }
      setLoading(true)
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: phoneOrEmail,
        password,
      })
      setLoading(false)

      if (loginError) {
        setError(loginError.message)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        setError('프로필 정보 조회 실패: ' + profileError.message)
        return
      }
      if (profile?.role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        setError('관리자 권한이 없는 계정입니다.')
      }
      return
    }

    const internationalPhone = toInternational(phoneOrEmail)
    if (!code) {
      setError('인증번호를 입력하세요.')
      return
    }
    setLoading(true)

    const inputPhoneNormalized = phoneOrEmail.replace(/-/g, '')
    const isDemoAccount = inputPhoneNormalized === DEMO_PHONE && code === DEMO_OTP

    let userId: string | undefined

    if (isDemoAccount && DEMO_EMAIL && DEMO_PASSWORD) {
      const { data: demoData, error: demoError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      setLoading(false)

      if (demoError) {
        setError('데모 계정 로그인 실패: ' + demoError.message)
        return
      }
      userId = demoData?.user?.id
    } else {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: internationalPhone,
        token: code,
        type: 'sms',
      })
      setLoading(false)

      if (verifyError) {
        setError(verifyError.message)
        return
      }
      userId = data?.user?.id || data?.session?.user?.id
    }

    if (!userId) {
      setError('유저 정보를 불러올 수 없습니다.')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError) {
      setError('프로필 정보 조회 실패: ' + profileError.message)
      return
    }
    if (profile?.role === 'admin') {
      router.replace('/admin/dashboard')
      return
    }

    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId)

    if (storeError) {
      setError('가게 정보 조회 실패: ' + storeError.message)
      return
    }
    if (!stores || stores.length === 0) {
      router.replace('/profile/add-store')
    } else {
      router.replace('/home')
    }
  }

  return (
    <div className="page-without-tabs bg-white">
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[70]">
          <Loading fullscreen={false} />
        </div>
      )}

      {/* Header */}
      <div className="app-header">
        <div className="h-[48px] px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
          <div className="w-10" />
        </div>
      </div>

      <div className="page-content">
        {/* Title */}
        <div className="px-5 pt-4 pb-8">
          <h1 className="text-[26px] font-bold text-[#1A1A1A] tracking-[-0.6px] leading-[1.35]">
            반가워요!<br />
            본인확인을 해주세요.
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-4 p-3 bg-red-50 rounded-[10px]">
            <p className="text-[13px] text-red-500 whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Phone Input + Send Button */}
        <div className="px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-[52px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4">
              <input
                type="text"
                inputMode={phoneOrEmail.includes('@') ? 'email' : 'tel'}
                value={phoneOrEmail}
                onChange={e => handleInputChange(e.target.value)}
                placeholder="휴대폰 번호 입력"
                disabled={loading}
                className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
              />
            </div>
            {!otpSent && (
              <button
                onClick={handleSendOtpOrPassword}
                disabled={loading || !phoneOrEmail}
                className="h-[52px] px-4 rounded-[10px] bg-[#1A1A1A] text-white text-[14px] font-semibold tracking-[-0.2px] whitespace-nowrap disabled:bg-[#E5E5EA] disabled:text-[#C7C7CC] active:bg-[#333] transition-colors flex-shrink-0"
              >
                인증번호 발송
              </button>
            )}
          </div>
        </div>

        {/* OTP / Password Input */}
        {otpSent && (
          <div className="px-5 pt-3">
            {isAdminFlow ? (
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-[52px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    disabled={loading}
                    className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading || !password}
                  className="h-[52px] px-6 rounded-[10px] bg-[#1A1A1A] text-white text-[14px] font-semibold tracking-[-0.2px] whitespace-nowrap disabled:bg-[#E5E5EA] disabled:text-[#C7C7CC] active:bg-[#333] transition-colors flex-shrink-0"
                >
                  확인
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-[52px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="인증번호 입력"
                    disabled={loading}
                    className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading || !code}
                  className="h-[52px] px-6 rounded-[10px] bg-[#1A1A1A] text-white text-[14px] font-semibold tracking-[-0.2px] whitespace-nowrap disabled:bg-[#E5E5EA] disabled:text-[#C7C7CC] active:bg-[#333] transition-colors flex-shrink-0"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        )}

        {/* Signup Link */}
        <div className="px-5 pt-6">
          <button
            onClick={() => router.push('/signup')}
            className="flex items-center gap-1 active:opacity-60 transition-opacity"
          >
            <span className="text-[14px] text-[#8E8E93] tracking-[-0.2px]">
              아직 회원이 아니신가요?
            </span>
            <span className="text-[14px] font-semibold text-[#EB5B37] tracking-[-0.2px]">
              회원가입
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#EB5B37]" />
          </button>
        </div>

        {/* Demo Mode */}
        {!isDemoMode ? (
          <div className="px-5 pt-10">
            <button
              onClick={() => { setIsDemoMode(true); setError('') }}
              className="text-[13px] text-[#C7C7CC] tracking-[-0.2px] underline underline-offset-2 active:text-[#8E8E93] transition-colors"
            >
              데모 체험하기
            </button>
          </div>
        ) : (
          <div className="mx-5 mt-6 p-3 bg-[#F5F5F7] rounded-[10px]">
            <p className="text-[12px] text-[#8E8E93] tracking-[-0.2px]">
              데모 모드 - 아무 값이나 입력하여 플로우를 체험하세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
