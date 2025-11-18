'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { SERVICE_NAME_MAP } from '@/lib/constants'

interface ServiceRequest {
  id: string
  status: string
  created_at: string
  working_at: string | null
  completed_at: string | null
  canceled_at: string | null
  service_name: string
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

const PRICE = {
  '(일반화구) 1열 1구': 19000,
  '(일반화구) 2열 2구': 33000,
  '(일반화구) 3열 3구': 75000,
  '(시그마버너) 1열 1구': 27000,
  '(시그마버너) 2열 2구': 40000,
  '(시그마버너) 3열 3구': 140000,
  '8미리 밸브교체': 15000,
  '공기조절기 교체': 15000,
  '경보기 교체': 15000,
  '배관 철거': 15000,
  '가스누출점검(기본출장비)': 3000,
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

    // 2. 서비스를 요청한 사용자에게 알림 생성
    const { data: requestData } = await supabase
      .from('service_requests')
      .select('user_id')
      .eq('id', request.id)
      .single()

    if (requestData?.user_id) {
      const statusMessages = {
        진행중: {
          title: '서비스 요청이 수락되었습니다',
          message: `${SERVICE_NAME_MAP[serviceName] || '서비스'} 요청이 수락되어 작업이 시작됩니다.`,
        },
        완료: {
          title: '서비스가 완료되었습니다',
          message: `${SERVICE_NAME_MAP[serviceName] || '서비스'}가 성공적으로 완료되었습니다.`,
        },
        취소: {
          title: '서비스 요청이 취소되었습니다',
          message: `${SERVICE_NAME_MAP[serviceName] || '서비스'} 요청이 취소되었습니다. 자세한 내용은 고객센터로 문의해주세요.`,
        },
      }

      const notificationContent =
        statusMessages[newStatus as keyof typeof statusMessages] || {
          title: '서비스 상태가 변경되었습니다',
          message: `서비스 상태가 [${newStatus}]로 변경되었습니다.`,
        }

      const insertData = {
        user_id: requestData.user_id,
        type: 'service',
        title: notificationContent.title,
        message: notificationContent.message,
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

  const rawSteps = [
    { label: '요청됨', timestamp: request?.created_at },
    { label: '작업 시행 중', timestamp: request?.working_at },
    { label: '서비스 완료', timestamp: request?.completed_at },
    { label: '취소됨', timestamp: request?.canceled_at },
  ]

  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (!request) return
    if (request.status === '취소') {
      setCurrentStepIndex(3)
    } else {
      setCurrentStepIndex(rawSteps.findLastIndex((step) => !!step.timestamp))
    }
  }, [request])

  const stepList = rawSteps.map((step, idx) => {
    const dateTime = step.timestamp ? new Date(step.timestamp) : null
    return {
      label: step.label,
      date: dateTime
        ? dateTime.toISOString().slice(5, 10).replace('-', '/')
        : '',
      time: dateTime ? dateTime.toTimeString().slice(0, 5) : '',
      inactive: idx > currentStepIndex,
      isActive: idx === currentStepIndex,
    }
  })

  const total = details.reduce((sum, d) => {
    const count = parseInt(d.value.replace(/[^0-9]/g, '')) || 0
    const key = d.key || ''
    const unitPrice = PRICE[key as keyof typeof PRICE] ?? 0
    return sum + count * unitPrice
  }, 0)

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
    const dateObj = new Date(rawTime)
    const date = dateObj.toISOString().slice(0, 10).replace(/-/g, '/')
    const time = dateObj.toTimeString().slice(0, 5)
    return `${date}, ${time}`
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
  const serviceName = request.services?.name || '화구교체'

  return (
    <div className="min-h-screen bg-white pb-32">
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

      <div className="px-5 py-6 space-y-4">
        {/* 상태 안내 */}
        <div
          className="p-4 flex items-center rounded-lg"
          style={{ backgroundColor: statusConfig.bgColor }}
        >
          <div className="flex-1">
            <p className="text-gray-800 font-bold text-[18px] mb-1">
              {statusConfig.title}
            </p>
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

        {/* 가게 정보 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-[15px] text-gray-800 font-semibold mb-2">
            {request.stores?.name || '가게 정보 없음'}
          </p>
          <div className="flex items-center text-gray-600 text-[13px]">
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
        </div>

        {/* 상태 정보 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
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
              <span className="text-gray-800 text-[13px]">
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
        </div>

        {/* 요청 항목 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="font-bold text-lg text-gray-800 mb-4">
            {SERVICE_NAME_MAP[serviceName] || '화구 교체 서비스'}
          </p>
          <div className="space-y-3 mb-4">
            {details
              .filter((item) => !['방문 희망 날짜', '방문 희망 시간', '결제 방법'].includes(item.key))
              .map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="text-gray-600 text-base mr-2">{item.key}</span>
                  <span className="bg-[#FFF1EF] rounded-full px-3 py-1 text-[#EB5A36] text-xs font-bold">
                    x{item.value}
                  </span>
                </div>
              ))}
          </div>
          <button className="bg-[#FFF1EF] rounded-lg px-4 py-2 flex items-center hover:bg-[#FFE5E0] transition-colors">
            <svg
              className="w-4 h-4 text-[#EB5A36] mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-[#EB5A36] text-[15px] font-semibold">
              요청사항 자세히 보기
            </span>
          </button>
        </div>

        {/* 방문 정보 */}
        {(details.find((d) => d.key === '방문 희망 날짜') ||
          details.find((d) => d.key === '방문 희망 시간')) && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-[#EB5A36] mr-2"
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
              <p className="font-bold text-base text-gray-800">방문 일정</p>
            </div>
            <div className="space-y-2">
              {details
                .filter((d) =>
                  ['방문 희망 날짜', '방문 희망 시간'].includes(d.key)
                )
                .map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-600 text-[14px]">{item.key}</span>
                    <span className="text-gray-800 font-semibold text-[14px]">
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 결제 방법 */}
        {details.find((d) => d.key === '결제 방법') && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-[#EB5A36] mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <p className="font-bold text-base text-gray-800">결제 방법</p>
            </div>
            <p className="text-gray-800 font-semibold text-[15px]">
              {details.find((d) => d.key === '결제 방법')?.value}
            </p>
          </div>
        )}

        {/* 전체 요청 금액 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-gray-800 text-[16px] font-bold">전체 요청</p>
          <p className="text-[#EB5A36] font-bold text-[18px]">
            {total.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      {(request.status === '요청됨' || request.status === '진행중') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6">
          <div className="flex gap-3 max-w-screen-xl mx-auto">
            {request.status === '요청됨' ? (
              <>
                <button
                  className="flex-1 bg-[#EB5A36] hover:bg-[#FF5A36] py-3 rounded-lg font-bold text-white transition-colors disabled:opacity-50"
                  onClick={() => handleStatusUpdate('진행중', 'working_at')}
                  disabled={submitting}
                >
                  수락하기
                </button>
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold text-gray-800 transition-colors disabled:opacity-50"
                  onClick={() => handleStatusUpdate('취소', 'canceled_at')}
                  disabled={submitting}
                >
                  거절하기
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex-1 bg-[#EB5A36] hover:bg-[#FF5A36] py-3 rounded-lg font-bold text-white transition-colors disabled:opacity-50"
                  onClick={() => handleStatusUpdate('완료', 'completed_at')}
                  disabled={submitting}
                >
                  완료하기
                </button>
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg font-bold text-gray-800 transition-colors disabled:opacity-50"
                  onClick={() => handleStatusUpdate('취소', 'canceled_at')}
                  disabled={submitting}
                >
                  취소하기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 타임라인 모달 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="py-4">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setShowModal(false)}>
              <p className="text-[#E64B32] text-[14px]">닫기</p>
            </button>
            <p className="text-gray-800 text-[16px] font-semibold">
              요청 처리 기록
            </p>
            <div className="w-9" />
          </div>

          <div className="h-px bg-[#DBDBDB] -mx-6 mb-4" />

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-[13px]">서비스 처리 ID</p>
            <p className="text-gray-800 font-bold text-[14px]">
              {request.id.slice(0, 4)}-{request.id.slice(-4)}
            </p>
          </div>

          <div className="h-2 bg-[#F6F6F5] -mx-6 mb-12" />

          {stepList.map((step, idx) => {
            const isLast = idx === stepList.length - 1
            return (
              <div key={idx} className="flex items-start overflow-visible mb-0">
                {/* 날짜/시간 */}
                <div className="w-14 text-right mr-2">
                  <p className="text-gray-800 text-[13px] font-medium mb-1">
                    {step.date}
                  </p>
                  <p className="text-gray-400 text-[12px]">{step.time}</p>
                </div>

                {/* 타임라인 */}
                <div className="flex flex-col items-center mr-3">
                  <div
                    className={`w-[10px] h-[10px] rounded-full ${
                      step.isActive ? 'bg-[#FF5A36]' : 'bg-[#ddd]'
                    }`}
                  />
                  {!isLast && <div className="w-[1px] h-20 bg-[#E0E0E0]" />}
                </div>

                {/* 상태 박스 */}
                <div className="flex-1 rounded-md -mt-5 px-4 py-5 bg-[#F6F6F5]">
                  <p
                    className={`text-[14px] ${
                      step.isActive ? 'text-gray-800 font-bold' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}
