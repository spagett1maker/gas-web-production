'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatTime } from '@/utils/format'
import { SERVICE_NAME_MAP } from '@/lib/constants'

interface ServiceRequest {
  id: string
  status: string
  created_at: string
  working_at: string | null
  completed_at: string | null
  canceled_at: string | null
  services: {
    name: string
  }
  stores: {
    name: string
    address: string
  }
}

interface RequestDetail {
  key: string
  value: string
}

const STATUS_CONFIG = {
  요청됨: {
    bgColor: '#EAF5FE',
    title: '서비스 요청됨',
    description: '요청하신 서비스를 확인하고 있습니다.',
  },
  진행중: {
    bgColor: '#FEFBEA',
    title: '작업 시행 중',
    description: '서비스가 현재 진행 중입니다.',
  },
  완료: {
    bgColor: '#E6F4EA',
    title: '서비스 완료',
    description: '서비스가 성공적으로 완료되었습니다.',
  },
  취소: {
    bgColor: '#FFEAEA',
    title: '서비스 취소됨',
    description: '요청하신 서비스가 취소되었습니다.',
  },
}

export default function AdminServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [details, setDetails] = useState<RequestDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return

      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select(
          'id, status, created_at, working_at, completed_at, canceled_at, services(name), stores(name, address)'
        )
        .eq('id', params.id)
        .single()

      if (requestError) {
        console.error('서비스 요청 로드 실패:', requestError)
      } else {
        const formattedData = {
          ...requestData,
          services: Array.isArray(requestData.services)
            ? requestData.services[0]
            : requestData.services,
          stores: Array.isArray(requestData.stores)
            ? requestData.stores[0]
            : requestData.stores,
        }
        setRequest(formattedData as ServiceRequest)
      }

      const { data: detailData, error: detailError } = await supabase
        .from('request_details')
        .select('key, value')
        .eq('request_id', params.id)

      if (detailError) {
        console.error('요청 상세 로드 실패:', detailError)
      } else {
        setDetails(detailData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [params.id])

  const handleStatusUpdate = async (newStatus: string, timeField: string) => {
    if (!request || submitting) return

    setSubmitting(true)

    const now = new Date().toISOString()
    const updateData: any = { status: newStatus, [timeField]: now }

    // 1. 상태 업데이트
    const { error: updateError } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', request.id)

    if (updateError) {
      console.error('상태 업데이트 실패:', updateError)
      alert('상태 업데이트에 실패했습니다.')
      setSubmitting(false)
      return
    }

    // 2. 알림 생성
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user.id

    if (userId) {
      const insertData = {
        user_id: userId,
        type: 'status_update',
        title: '서비스 상태 변경',
        message: `서비스가 [${newStatus}] 상태로 변경되었습니다.`,
        read: false,
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([insertData])

      if (notificationError) {
        console.error('알림 생성 실패:', notificationError)
      }
    }

    // 3. 로컬 상태 업데이트
    setRequest({ ...request, ...updateData })

    // 4. 성공 메시지
    const statusMessage = {
      진행중: '요청이 수락되었습니다.',
      완료: '작업이 완료되었습니다.',
      취소: '요청이 거절되었습니다.',
    }

    alert(
      statusMessage[newStatus as keyof typeof statusMessage] ||
        '상태가 업데이트되었습니다.'
    )
    setSubmitting(false)
  }

  const getStatusTime = () => {
    if (!request) return ''

    let rawTime: string | null | undefined = null

    switch (request.status) {
      case '요청됨':
        rawTime = request.created_at
        break
      case '진행중':
        rawTime = request.working_at
        break
      case '완료':
        rawTime = request.completed_at
        break
      case '취소':
        rawTime = request.canceled_at
        break
      default:
        return ''
    }

    if (!rawTime) return ''
    return `${formatDate(rawTime)}, ${formatTime(rawTime)}`
  }

  const getCurrentStepIndex = () => {
    if (!request) return 0

    const steps = [
      { label: '요청됨', timestamp: request.created_at },
      { label: '작업 시행 중', timestamp: request.working_at },
      { label: '서비스 완료', timestamp: request.completed_at },
      { label: '취소됨', timestamp: request.canceled_at },
    ]

    if (request.status === '취소') return 3

    return steps.findLastIndex((step) => !!step.timestamp)
  }

  const getStepList = () => {
    if (!request) return []

    const rawSteps = [
      { label: '요청됨', timestamp: request.created_at },
      { label: '작업 시행 중', timestamp: request.working_at },
      { label: '서비스 완료', timestamp: request.completed_at },
      { label: '취소됨', timestamp: request.canceled_at },
    ]

    const currentStepIndex = getCurrentStepIndex()

    return rawSteps.map((step, idx) => ({
      label: step.label,
      date: step.timestamp ? formatDate(step.timestamp) : '',
      time: step.timestamp ? formatTime(step.timestamp) : '',
      isActive: idx === currentStepIndex,
    }))
  }

  if (loading) {
    return <Loading />
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">서비스 요청을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const statusConfig =
    STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG['요청됨']
  const serviceName = request.services?.name || '알 수 없음'

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 상단 헤더 */}
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
        <h1 className="text-[22px] font-bold text-gray-800">세부정보</h1>
        <div className="w-7" />
      </header>

      {/* 상태 안내 */}
      <div
        className="pt-6 pb-4 px-5 flex items-center justify-between"
        style={{ backgroundColor: statusConfig.bgColor }}
      >
        <div className="flex-1">
          <h2 className="text-gray-800 font-bold text-[18px] mb-1">
            {statusConfig.title}
          </h2>
          <p className="text-gray-700 text-[13px]">{statusConfig.description}</p>
        </div>
        <div className="w-18 h-18 relative flex-shrink-0 ml-4">
          <Image
            src="/images/star.png"
            alt="star"
            width={72}
            height={72}
            className="object-contain"
          />
        </div>
      </div>

      <div className="px-5 py-6 space-y-4">
        {/* 가게 정보 */}
        <Card>
          <CardBody>
            <h3 className="text-[15px] text-gray-800 font-semibold mb-1">
              {request.stores?.name || '가게 정보 없음'}
            </h3>
            <div className="flex items-center text-gray-600 text-[12px]">
              <svg
                className="w-4 h-4 text-[#EB5A36] mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{request.stores?.address || '주소 정보 없음'}</span>
            </div>
          </CardBody>
        </Card>

        {/* 상태 정보 */}
        <Card>
          <CardBody>
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-800 text-[12px]">
                  {statusConfig.title} : {getStatusTime()}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-[#EB5A36]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </CardBody>
        </Card>

        {/* 요청 항목 */}
        <Card>
          <CardBody>
            <h3 className="font-bold text-lg text-gray-800 mb-3">
              {SERVICE_NAME_MAP[serviceName] || serviceName}
            </h3>
            <div className="space-y-3">
              {details.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="text-gray-600 text-base mr-2">{item.key}</span>
                  <span className="bg-[#FFF1EF] rounded-full px-3 py-1 text-[#EB5A36] text-xs font-bold">
                    x{item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 하단 버튼 */}
      {(request.status === '요청됨' || request.status === '진행중') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6">
          {request.status === '요청됨' ? (
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatusUpdate('진행중', 'working_at')}
                disabled={submitting}
                fullWidth
              >
                수락하기
              </Button>
              <Button
                onClick={() => handleStatusUpdate('취소', 'canceled_at')}
                disabled={submitting}
                variant="secondary"
                fullWidth
              >
                거절하기
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatusUpdate('완료', 'completed_at')}
                disabled={submitting}
                fullWidth
              >
                완료하기
              </Button>
              <Button
                onClick={() => handleStatusUpdate('취소', 'canceled_at')}
                disabled={submitting}
                variant="secondary"
                fullWidth
              >
                취소하기
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 타임라인 모달 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="py-4">
          <h3 className="text-[16px] font-semibold text-gray-800 mb-4 text-center">
            요청 처리 기록
          </h3>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-[13px]">서비스 처리 ID</span>
              <span className="text-gray-800 font-bold text-[14px]">
                {request.id.slice(0, 4)}-{request.id.slice(-4)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            {getStepList().map((step, idx) => {
              const isLast = idx === getStepList().length - 1
              return (
                <div key={idx} className="flex items-start mb-6 last:mb-0">
                  {/* 날짜/시간 */}
                  <div className="w-16 text-right mr-3">
                    <p className="text-gray-800 text-[13px] font-medium">
                      {step.date}
                    </p>
                    <p className="text-gray-500 text-[12px]">{step.time}</p>
                  </div>

                  {/* 타임라인 */}
                  <div className="flex flex-col items-center mr-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        step.isActive ? 'bg-[#FF5A36]' : 'bg-gray-300'
                      }`}
                    />
                    {!isLast && (
                      <div className="w-px h-20 bg-gray-200 my-1" />
                    )}
                  </div>

                  {/* 상태 박스 */}
                  <div
                    className={`flex-1 rounded-md px-4 py-3 ${
                      step.isActive ? 'bg-gray-100' : 'bg-gray-50'
                    }`}
                  >
                    <p
                      className={`text-[14px] ${
                        step.isActive
                          ? 'text-gray-800 font-bold'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}
