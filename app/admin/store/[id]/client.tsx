'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { Card, CardBody } from '@/components/ui/Card'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { formatDate, formatTime } from '@/utils/format'

interface Store {
  id: string
  name: string
  address: string
  user_id: string
  created_at: string
}

interface ServiceRequest {
  id: string
  status: string
  created_at: string
  services: {
    name: string
  }
}

const STATUS_COLORS = {
  요청됨: '#FF9500',
  진행중: '#007AFF',
  완료: '#34C759',
  취소: '#FF3B30',
}

export default function AdminStoreDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [store, setStore] = useState<Store | null>(null)
  const [phone, setPhone] = useState('')
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStoreAndRequests = async () => {
      if (!id) return

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single()

      if (storeError || !storeData) {
        console.warn('가게 조회 실패:', storeError?.message)
        setLoading(false)
        return
      }

      setStore(storeData)

      const { data: userData } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', storeData.user_id)
        .single()

      setPhone(userData?.phone || '')

      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('id, status, created_at, services(name)')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })

      if (requestError) {
        console.warn('서비스 요청 불러오기 실패:', requestError.message)
      } else {
        const formattedRequests = (requestData || []).map((req: any) => ({
          ...req,
          services: Array.isArray(req.services) ? req.services[0] : req.services,
        }))
        setRequests(formattedRequests)
      }

      setLoading(false)
    }

    fetchStoreAndRequests()
  }, [id])

  if (loading) {
    return <Loading />
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">가게 정보를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="pt-6 pb-4 px-5 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg
            className="w-7 h-7 text-gray-800"
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
        <h1 className="text-[22px] font-bold text-gray-800">가게 정보</h1>
        <div className="w-7" />
      </header>

      <div className="px-5 py-6 space-y-4">
        <Card>
          <CardBody>
            <h2 className="text-lg font-bold text-gray-800 mb-4">기본 정보</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-sm mb-1">가게 이름</p>
                <p className="text-base font-semibold text-gray-800">
                  {store.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">위치</p>
                <p className="text-base text-gray-800">{store.address}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">등록한 사용자 전화번호</p>
                <p className="text-base text-gray-800">{phone || '정보 없음'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">등록일</p>
                <p className="text-base text-gray-800">
                  {formatDate(store.created_at)} {formatTime(store.created_at)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              서비스 요청 내역
            </h2>
            {requests.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                요청된 서비스가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const serviceName = Array.isArray(req.services)
                    ? req.services[0]?.name
                    : req.services?.name
                  const statusColor =
                    STATUS_COLORS[req.status as keyof typeof STATUS_COLORS] ||
                    '#8E8E93'

                  return (
                    <button
                      key={req.id}
                      onClick={() => router.push(`/admin/service/detail?id=${req.id}`)}
                      className="w-full border-b border-gray-200 pb-3 last:border-0 text-left hover:bg-gray-50 transition-colors rounded px-2 py-2"
                    >
                      <p className="text-base font-medium text-gray-800 mb-1">
                        {SERVICE_NAME_MAP[serviceName] || serviceName}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {formatDate(req.created_at)} •{' '}
                          {formatTime(req.created_at)}
                        </p>
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: statusColor + '20',
                            color: statusColor,
                          }}
                        >
                          {req.status}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
