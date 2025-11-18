'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { Loading } from '@/components/ui/Loading'

const CATEGORIES = ['전체', '화구 교체', '경보기 교체', '배관 철거', '가스누출 검사', '밸브 교체']

const STATUS_CONFIG = {
  '요청됨': {
    color: '#3B82F6', // info color
    bg: '#EFF6FF',
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 512 512">
        <path d="M272,464a16,16,0,0,1-16-16.42V264.13a8,8,0,0,0-8-8H64.41a16.31,16.31,0,0,1-15.49-10.65,16,16,0,0,1,8.41-19.87l384-176.15a16,16,0,0,1,21.22,21.19l-176,384A16,16,0,0,1,272,464Z"/>
      </svg>
    )
  },
  '진행중': {
    color: '#F59E0B', // warning color
    bg: '#FEF3C7',
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    )
  },
  '완료': {
    color: '#10B981', // success color
    bg: '#D1FAE5',
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    )
  },
  '취소': {
    color: '#EF4444', // error color
    bg: '#FEE2E2',
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
      </svg>
    )
  },
}

const getServiceIcon = (serviceName: string): string => {
  if (serviceName.includes('valve')) return '/images/valve.png'
  if (serviceName.includes('gas')) return '/images/gas.png'
  if (serviceName.includes('pipe')) return '/images/pipe.png'
  if (serviceName.includes('burner')) return '/images/burner.png'
  if (serviceName.includes('alarm')) return '/images/alarm.png'
  if (serviceName.includes('quote')) return '/images/quote.png'
  if (serviceName.includes('contract')) return '/images/contract.png'
  if (serviceName.includes('center')) return '/images/center.png'
  return '/images/default.png'
}

export default function MyServicePage() {
  const [selected, setSelected] = useState('전체')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const loadRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('service_requests')
      .select(`id, status, created_at, services(name)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('요청 불러오기 실패:', error.message)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadRequests()
    setRefreshing(false)
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      await loadRequests()
    }

    checkAuth()
  }, [])

  const filtered = requests.filter((r) => {
    const koreanName = SERVICE_NAME_MAP[r.services.name]
    if (selected === '전체') return true
    return koreanName?.includes(selected)
  })

  const grouped = filtered.reduce((acc, cur) => {
    const date = new Date(cur.created_at).toISOString().slice(0, 10)
    if (!acc[date]) acc[date] = []
    acc[date].push(cur)
    return acc
  }, {} as Record<string, typeof requests>)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-6 flex items-center justify-between sticky top-0 bg-background z-10 border-b border-[var(--color-border)]">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-7 h-7 text-primary"
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
        </button>
        <h1 className="heading-2 text-primary">나의 서비스</h1>
        <div className="w-7" />
      </header>

      {/* 카테고리 필터 */}
      <div className="overflow-x-auto px-4 py-4 mb-2">
        <div className="flex space-x-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-200 body-sm font-medium ${
                selected === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface text-secondary hover:bg-[var(--color-surface-hover)]'
              }`}
              onClick={() => setSelected(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 서비스 리스트 */}
      {loading ? (
        <Loading />
      ) : (
        <div className="pb-4">
          {refreshing && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-t-primary border-r-primary border-b-transparent border-l-transparent"></div>
            </div>
          )}

          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="body text-secondary">서비스 요청 내역이 없습니다.</p>
            </div>
          ) : (
            Object.keys(grouped).map((date) => (
              <div key={date} className="mb-3">
                <p className="body-sm font-semibold text-secondary px-6 mb-2 mt-2">
                  {date}
                </p>
                {grouped[date].map((service: any) => {
                  const statusConfig = STATUS_CONFIG[service.status as keyof typeof STATUS_CONFIG]
                  const iconPath = getServiceIcon(service.services.name)

                  return (
                    <button
                      key={service.id}
                      className="w-full flex items-center px-6 py-4 bg-white hover:bg-surface transition-colors active:bg-[var(--color-surface-hover)]"
                      onClick={() => router.push(`/my-service/${service.id}`)}
                    >
                      <div className="relative w-10 h-10 mr-4 flex-shrink-0">
                        <Image
                          src={iconPath}
                          alt={SERVICE_NAME_MAP[service.services.name] || service.services.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="flex-1 text-left body font-bold text-primary">
                        {SERVICE_NAME_MAP[service.services.name] || service.services.name}
                      </span>
                      <div
                        className="flex items-center justify-center"
                        style={{ color: statusConfig?.color }}
                      >
                        {statusConfig?.icon}
                      </div>
                    </button>
                  )
                })}
                <div className="h-px bg-[var(--color-border)] mx-6" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Pull to refresh 버튼 (모바일 웹용) */}
      {!loading && (
        <div className="fixed bottom-24 right-6">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50 active:scale-95"
            aria-label="새로고침"
          >
            <svg
              className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
