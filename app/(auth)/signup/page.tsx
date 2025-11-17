'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toInternational } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'

export default function SignupPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
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
    if (!validatePhone(phone)) {
      setError('올바른 휴대폰 번호를 입력하세요.\n예: 01012345678')
      return
    }

    const internationalPhone = toInternational(phone)
    setLoading(true)

    try {
      // 1. 이미 가입된 전화번호인지 profiles에서 조회
      const { data: existUsers, error: existError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', internationalPhone)

      if (existError) {
        throw existError
      }

      if (existUsers && existUsers.length > 0) {
        setError('이미 가입된 전화번호입니다.')
        setLoading(false)
        return
      }

      // 2. 미가입일 경우에만 인증번호 요청
      console.log('Sending OTP to:', internationalPhone)
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
      // 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        setError('유저 정보를 불러올 수 없습니다.')
        return
      }
      // 유저 정보를 profiles 테이블에 저장
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
    <div className="min-h-screen bg-white">
      {/* 상단 뒤로가기 */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-700 hover:text-[#EB5A36] transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          로그인 화면으로
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">회원가입</h1>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
            </div>
          )}

          <Input
            type="text"
            placeholder="전화번호 (예: 01012345678)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={otpSent}
            fullWidth
            className="mb-4"
          />

          {otpSent && (
            <Input
              type="text"
              placeholder="인증번호 입력"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              fullWidth
              className="mb-6"
            />
          )}

          {loading && <Loading />}

          {!otpSent ? (
            <Button
              onClick={handleSendOtp}
              disabled={loading}
              fullWidth
            >
              인증번호 보내기
            </Button>
          ) : (
            <Button
              onClick={handleSignup}
              disabled={loading}
              fullWidth
            >
              확인
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
