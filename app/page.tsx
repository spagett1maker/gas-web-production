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
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <Image
          src="/images/gasmoa-symbol.png"
          alt="가스모아"
          width={112}
          height={112}
          className="animate-fade-in-scale"
          priority
        />

        <h1
          className="mt-5 text-[26px] font-bold tracking-[-0.5px] text-[#173F3B] animate-slide-up"
          style={{ animationDelay: '120ms', opacity: 0 }}
        >
          가스모아
        </h1>

        <p
          className="mt-2 text-[14px] text-[#8E8E93] tracking-[-0.2px] animate-slide-up"
          style={{ animationDelay: '220ms', opacity: 0 }}
        >
          안심을 모아, 일상을 가볍게.
        </p>
      </div>

      {/* 로딩 인디케이터 */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center gap-[6px] animate-fade-in"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))', animationDelay: '320ms', opacity: 0 }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[6px] h-[6px] rounded-full bg-[#F87537] animate-pulse-dot"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
