'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toInternational } from '@/utils/format'
import { Loading } from '@/components/ui/Loading'
import { ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  // 전화번호 유효성 검사
  const validatePhone = (phoneNumber: string) => {
    const numbersOnly = phoneNumber.replace(/[^0-9]/g, '')
    if (!/^01[016789]/.test(numbersOnly)) {
      return false
    }
    if (numbersOnly.length !== 11) {
      return false
    }
    return true
  }

  // 인증번호 요청
  const handleSendOtp = async () => {
    if (!phone) {
      setError('전화번호를 입력하세요.')
      return
    }

    // 데모 모드: 형식 검증만 하고 바로 OTP 단계로
    if (isDemoMode) {
      setOtpSent(true)
      setError('')
      return
    }

    if (!validatePhone(phone)) {
      setError('올바른 휴대폰 번호를 입력하세요.\n예: 01012345678')
      return
    }

    const internationalPhone = toInternational(phone)
    setLoading(true)

    try {
      const { data: existUsers, error: existError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', internationalPhone)

      if (existError) {
        throw existError
      }

      if (existUsers && existUsers.length > 0) {
        setError('이미 가입된 전화번호입니다.')
        setLoading(false)
        return
      }

      const { data, error: otpError } = await supabase.auth.signInWithOtp({
        phone: internationalPhone,
        options: {
          shouldCreateUser: true,
        },
      })

      if (otpError) {
        console.error('Supabase OTP Error:', otpError)
        setError(otpError.message || '인증번호 전송에 실패했습니다.')
      } else {
        console.log('OTP sent successfully:', data)
        setOtpSent(true)
        alert('인증번호가 전송되었습니다.')
        setError('')
      }
    } catch (err) {
      console.error('Network/Error:', err)
      setError('인증번호 전송 중 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 인증번호로 회원가입
  const handleSignup = async () => {
    if (!phone || !code) {
      setError('전화번호와 인증번호를 모두 입력하세요.')
      return
    }

    // 데모 모드: API 호출 없이 가게 등록 화면으로 이동
    if (isDemoMode) {
      localStorage.setItem('demo_mode', 'true')
      router.replace('/profile/add-store')
      return
    }

    // 실제 회원가입 시 데모 모드 해제
    localStorage.removeItem('demo_mode')

    const internationalPhone = toInternational(phone)
    setLoading(true)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: internationalPhone,
      token: code,
      type: 'sms',
    })
    setLoading(false)

    if (verifyError) {
      setError(verifyError.message)
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        setError('유저 정보를 불러올 수 없습니다.')
        return
      }
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          phone: internationalPhone,
        })

      if (profileError) {
        setError('프로필 생성 실패: ' + profileError.message)
        return
      }

      alert('회원가입이 완료되었습니다.\n가게 추가 화면으로 이동합니다.')
      router.replace('/profile/add-store')
    }
  }

  // 로그인 화면으로 돌아가기
  const handleBack = () => {
    router.back()
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
        <div className="h-[48px] px-4 flex items-center">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Title */}
        <div className="px-5 pt-4 pb-8">
          <h1 className="text-[26px] font-bold text-[#1A1A1A] tracking-[-0.6px] leading-[1.35]">
            회원가입
          </h1>
          <p className="mt-2 text-[14px] text-[#8E8E93] tracking-[-0.2px]">
            휴대폰 번호로 간편하게 가입하세요.
          </p>
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
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="휴대폰 번호 입력"
                disabled={otpSent || loading}
                className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
              />
            </div>
            {!otpSent && (
              <button
                onClick={handleSendOtp}
                disabled={loading || !phone}
                className="h-[52px] px-4 rounded-[10px] bg-[#1A1A1A] text-white text-[14px] font-semibold tracking-[-0.2px] whitespace-nowrap disabled:bg-[#E5E5EA] disabled:text-[#C7C7CC] active:bg-[#333] transition-colors flex-shrink-0"
              >
                인증번호 발송
              </button>
            )}
          </div>
        </div>

        {/* OTP Input */}
        {otpSent && (
          <div className="px-5 pt-3">
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-[52px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4">
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="인증번호 입력"
                  disabled={loading}
                  className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
                />
              </div>
              <button
                onClick={handleSignup}
                disabled={loading || !code}
                className="h-[52px] px-6 rounded-[10px] bg-[#1A1A1A] text-white text-[14px] font-semibold tracking-[-0.2px] whitespace-nowrap disabled:bg-[#E5E5EA] disabled:text-[#C7C7CC] active:bg-[#333] transition-colors flex-shrink-0"
              >
                확인
              </button>
            </div>
          </div>
        )}

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
