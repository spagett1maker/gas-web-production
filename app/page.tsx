'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'

const SERVICES = [
  { key: 'burner', label: '화구교체', image: '/images/burner.png' },
  { key: 'valve', label: '밸브 교체\n(공기 조절기)', image: '/images/valve.png' },
  { key: 'alarm', label: '경보기 교체', image: '/images/alarm.png' },
  { key: 'quote', label: '시공견적 문의', image: '/images/quote.png' },
  { key: 'pipe', label: '배관 시공 및 철거', image: '/images/pipe.png' },
  { key: 'gas', label: '가스누출 검사', image: '/images/gas.png' },
  { key: 'contract', label: '정기계약 이용권', image: '/images/contract.png' },
  { key: 'center', label: '고객센터', image: '/images/center.png' },
]

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          router.replace('/login')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  const filtered = SERVICES.filter((s) =>
    s.label.replace(/\s/g, '').includes(search.replace(/\s/g, ''))
  )

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-6 flex items-center justify-between">
        <div className="w-10" />
        <div className="relative w-[100px] h-[57px]">
          <Image
            src="/images/logo2.png"
            alt="우리동네가스 로고"
            fill
            className="object-contain"
            priority
          />
        </div>
        <button
          onClick={() => router.push('/notification')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="알림"
        >
          <svg
            className="w-7 h-7 text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
      </header>

      {/* 검색창 */}
      <div className="px-6 mb-6">
        <div className="flex items-center bg-surface rounded-2xl h-12 px-4 shadow-sm border border-transparent focus-within:border-primary transition-colors">
          <svg
            className="w-5 h-5 text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className="flex-1 bg-transparent px-3 body/ text-base text-primary placeholder:text-tertiary outline-none"
            placeholder="어떤 서비스를 찾으시나요?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <button onClick={() => setSearch('')} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
              <svg
                className="w-5 h-5 text-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 서비스 카드 그리드 */}
      <div className="mt-3 px-6">
        {search.length === 0 ? (
          // 전체 카드 그리드 (3x3)
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {SERVICES.map((item) => (
              <button
                key={item.key}
                className="aspect-square bg-white rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 border border-transparent hover:border-primary/20"
                onClick={() =>
                  router.push(
                    item.key === 'center' ? '/contact' : `/service/${item.key}`
                  )
                }
              >
                <div className="w-12 h-12 mb-2 relative">
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="body-sm/ text-[12px] font-medium text-primary text-center leading-tight whitespace-pre-line px-2">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // 검색 결과 없음
          <div className="flex items-center justify-center py-20">
            <p className="body text-secondary">결과가 없습니다.</p>
          </div>
        ) : (
          // 검색 결과
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {filtered.map((item) => (
              <button
                key={item.key}
                className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 border border-transparent hover:border-primary/20"
                onClick={() =>
                  router.push(
                    item.key === 'center' ? '/contact' : `/service/${item.key}`
                  )
                }
              >
                <div className="w-12 h-12 mb-2 relative">
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="body-sm font-medium text-primary text-center leading-1 whitespace-pre-line px-2">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
