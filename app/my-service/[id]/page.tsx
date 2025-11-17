'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { formatDate, formatTime } from '@/utils/format'
import { Loading } from '@/components/ui/Loading'
import { Card, CardBody } from '@/components/ui/Card'

const STATUS_CONFIG = {
  요청됨: { color: '#90CAF9', bg: '#E3F2FD', icon: '📍' },
  진행중: { color: '#FFD36F', bg: '#FFF7E0', icon: '⏸️' },
  완료: { color: '#4DD0A1', bg: '#E0F7EF', icon: '✅' },
  취소: { color: '#FF6B6B', bg: '#FFEAEA', icon: '❌' },
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServiceDetail = async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          services(name),
          stores(name, address),
          request_details(key, value)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('서비스 상세 로드 실패:', error)
      } else {
        setService(data)
      }
      setLoading(false)
    }

    if (params.id) {
      fetchServiceDetail()
    }
  }, [params.id])

  if (loading) {
    return <Loading />
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">서비스를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[service.status as keyof typeof STATUS_CONFIG]
  const serviceName = Array.isArray(service.services)
    ? service.services[0]?.name
    : service.services?.name
  const storeName = Array.isArray(service.stores)
    ? service.stores[0]?.name
    : service.stores?.name
  const storeAddress = Array.isArray(service.stores)
    ? service.stores[0]?.address
    : service.stores?.address

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-5 flex items-center justify-between bg-white border-b border-gray-200">
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
        <h1 className="text-[22px] font-bold text-gray-800">서비스 상세</h1>
        <div className="w-7" />
      </header>

      <div className="px-5 py-6 space-y-4">
        {/* 상태 카드 */}
        <Card>
          <CardBody className="text-center py-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
              style={{ backgroundColor: statusConfig?.bg }}
            >
              {statusConfig?.icon}
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: statusConfig?.color }}
            >
              {service.status}
            </h2>
            <p className="text-gray-600">
              {service.status === '요청됨'
                ? '서비스가 접수되었습니다'
                : service.status === '진행중'
                ? '작업이 진행중입니다'
                : service.status === '완료'
                ? '서비스가 완료되었습니다'
                : '서비스가 취소되었습니다'}
            </p>
          </CardBody>
        </Card>

        {/* 서비스 정보 */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              서비스 정보
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">서비스 종류</span>
                <span className="font-semibold text-gray-800">
                  {SERVICE_NAME_MAP[serviceName] || serviceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">신청일</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(service.created_at)} {formatTime(service.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">최종 업데이트</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(service.updated_at)} {formatTime(service.updated_at)}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 가게 정보 */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-bold text-gray-800 mb-4">가게 정보</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-gray-600 w-20">가게명</span>
                <span className="font-semibold text-gray-800 flex-1">
                  {storeName || '정보 없음'}
                </span>
              </div>
              {storeAddress && (
                <div className="flex items-start">
                  <span className="text-gray-600 w-20">주소</span>
                  <span className="text-gray-800 flex-1">{storeAddress}</span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 상세 내역 */}
        {service.request_details && service.request_details.length > 0 && (
          <Card>
            <CardBody>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                상세 내역
              </h3>
              <div className="space-y-2">
                {service.request_details.map((detail: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-600">{detail.key}</span>
                    <span className="font-semibold text-gray-800">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
