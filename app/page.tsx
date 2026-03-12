'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const start = Date.now()

    const init = async () => {
      let route = '/login'

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          localStorage.removeItem('demo_mode')
          route = '/home'
        } else if (localStorage.getItem('demo_mode') === 'true') {
          route = '/home'
        }
      } catch {
        // 에러 시 로그인으로
      }

      // 최소 800ms 스플래시 표시 보장
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 800 - elapsed)
      setTimeout(() => router.replace(route), remaining)
    }

    init()
  }, [router])

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="w-[180px] h-[110px] relative animate-fade-in">
        <Image
          src="/images/logo2.png"
          alt="우리동네가스"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
