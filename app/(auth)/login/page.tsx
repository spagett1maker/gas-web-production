'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toInternational } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import Image from 'next/image'

const ADMIN_EMAIL = 'GAS@gas.com'

export default function LoginPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAdminFlow, setIsAdminFlow] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  // 입력값이 바뀔 때마다 state 초기화
  const handleInputChange = (text: string) => {
    setPhoneOrEmail(text)
    setIsAdminFlow(false)
    setOtpSent(false)
    setCode('')
    setPassword('')
    setError('')
  }

  // "인증번호 보내기" or "비밀번호 입력" 분기
  const handleSendOtpOrPassword = async () => {
    if (!phoneOrEmail) {
      setError('전화번호를 입력하세요.')
      return
    }

    if (phoneOrEmail.includes('@')) {
      // 이메일이면 관리자 로그인 플로우
      setIsAdminFlow(true)
      setOtpSent(true) // 비밀번호 입력창 띄움
      return
    }

    // 일반 유저: 휴대폰 로그인
    const internationalPhone = toInternational(phoneOrEmail)

    setLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: internationalPhone
    })
    setLoading(false)

    if (otpError) {
      setError(otpError.message)
    } else {
      setOtpSent(true)
      alert('인증번호가 전송되었습니다.')
    }
  }

  // "확인" 클릭시
  const handleLogin = async () => {
    if (isAdminFlow) {
      // 관리자: 이메일+비번 로그인
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

      // 프로필 role 검사
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
        router.replace('/admin/service')
      } else {
        setError('관리자 권한이 없는 계정입니다.')
      }
      return
    }

    // 일반 유저: OTP 인증
    const internationalPhone = toInternational(phoneOrEmail)
    if (!code) {
      setError('인증번호를 입력하세요.')
      return
    }
    setLoading(true)
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

    // 세션에서 내 id/phone 가져오기
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user.id
    if (!userId) {
      setError('유저 정보를 불러올 수 없습니다.')
      return
    }

    // profiles에서 role 체크
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
      router.replace('/admin/service')
      return
    }

    // 유저: 가게 정보 체크 후 라우팅
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
      router.replace('/')
    }
  }

  const handleSignup = () => {
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="flex justify-center mb-12">
          <div className="w-[172.8px] h-[104.6px] relative">
            <Image
              src="/images/logo2.png"
              alt="우리동네가스 로고"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 전화번호/이메일 입력창 */}
        <Input
          type="text"
          placeholder="전화번호 (예: 01012345678)"
          value={phoneOrEmail}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={loading}
          fullWidth
          className="mb-2"
        />

        {/* 입력창(OTP/비밀번호) 분기 */}
        {otpSent && (
          isAdminFlow ? (
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              fullWidth
              className="mb-6"
            />
          ) : (
            <Input
              type="text"
              placeholder="인증번호 입력"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              fullWidth
              className="mb-6"
            />
          )
        )}

        {loading && <Loading />}

        {/* 버튼 */}
        {!otpSent ? (
          <Button
            onClick={handleSendOtpOrPassword}
            disabled={loading}
            fullWidth
            className="mb-4"
          >
            인증번호 보내기
          </Button>
        ) : (
          <Button
            onClick={handleLogin}
            disabled={loading}
            fullWidth
            className="mb-4"
          >
            확인
          </Button>
        )}

        {/* 구분선 */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-gray-500 text-sm">또는</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* 회원가입 버튼 */}
        <button
          onClick={handleSignup}
          className="w-full py-3 text-center text-gray-700 font-medium hover:text-[#EB5A36] transition-colors"
        >
          회원가입
        </button>
      </div>
    </div>
  )
}
