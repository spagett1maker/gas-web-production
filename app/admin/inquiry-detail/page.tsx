'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime } from '@/utils/format'

interface InquiryResponse {
  id: string
  content: string
  created_at: string
  admin_id: string | null
  is_internal_note: boolean
}

interface InquiryDetail {
  id: string
  title: string
  content: string
  category: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  user_id: string
  stores?: {
    name: string
  }
  inquiry_responses: InquiryResponse[]
}

const STATUSES = ['접수됨', '처리중', '완료', '보류']

const STATUS_COLORS = {
  접수됨: { bg: '#FFF4E6', text: '#FF9500' },
  처리중: { bg: '#E3F2FD', text: '#007AFF' },
  완료: { bg: '#E8F5E9', text: '#34C759' },
  보류: { bg: '#FFEBEE', text: '#FF3B30' },
}

const PRIORITY_COLORS = {
  높음: { bg: '#FFEBEE', text: '#FF3B30' },
  보통: { bg: '#FFF4E6', text: '#FF9500' },
  낮음: { bg: '#E8F5E9', text: '#34C759' },
}

function AdminInquiryDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inquiry_id = searchParams.get('id')
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)

  useEffect(() => {
    const getAdminId = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user?.id) {
        setAdminId(data.user.id)
      }
    }
    getAdminId()
  }, [])

  useEffect(() => {
    const fetchInquiryDetail = async () => {
      if (!inquiry_id) return

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id,
          title,
          content,
          category,
          status,
          priority,
          created_at,
          updated_at,
          user_id,
          stores(name),
          inquiry_responses(
            id,
            content,
            created_at,
            admin_id,
            is_internal_note
          )
        `)
        .eq('id', inquiry_id)
        .single()

      if (error) {
        console.error('문의글 상세 정보 불러오기 실패:', error)
      } else {
        // 답변을 생성일시 순으로 정렬
        if (data.inquiry_responses) {
          data.inquiry_responses.sort(
            (a: InquiryResponse, b: InquiryResponse) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }

        const formattedData = {
          ...data,
          stores: Array.isArray(data.stores) ? data.stores[0] : data.stores,
        }
        setInquiry(formattedData as InquiryDetail)
      }
      setLoading(false)
    }

    fetchInquiryDetail()
  }, [inquiry_id])

  const updateStatus = async (newStatus: string) => {
    if (!inquiry || !inquiry_id) return

    const { error } = await supabase
      .from('inquiries')
      .update({ status: newStatus })
      .eq('id', inquiry_id)

    if (error) {
      alert('상태 변경에 실패했습니다.')
      return
    }

    setInquiry({ ...inquiry, status: newStatus })
    alert(`상태가 '${newStatus}'로 변경되었습니다.`)
  }

  const submitResponse = async () => {
    if (!responseText.trim() || !inquiry_id || !adminId) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from('inquiry_responses').insert({
      inquiry_id,
      admin_id: adminId,
      content: responseText.trim(),
      is_internal_note: false,
    })

    if (error) {
      alert('답변 등록에 실패했습니다.')
      setSubmitting(false)
      return
    }

    setResponseText('')
    alert('답변이 등록되었습니다.')

    // 새로고침
    const { data } = await supabase
      .from('inquiries')
      .select(`
        id,
        title,
        content,
        category,
        status,
        priority,
        created_at,
        updated_at,
        user_id,
        stores(name),
        inquiry_responses(
          id,
          content,
          created_at,
          admin_id,
          is_internal_note
        )
      `)
      .eq('id', inquiry_id)
      .single()

    if (data) {
      if (data.inquiry_responses) {
        data.inquiry_responses.sort(
          (a: InquiryResponse, b: InquiryResponse) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }

      const formattedData = {
        ...data,
        stores: Array.isArray(data.stores) ? data.stores[0] : data.stores,
      }
      setInquiry(formattedData as InquiryDetail)
    }

    setSubmitting(false)
  }

  if (loading) {
    return <Loading />
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">문의글을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const priorityConfig =
    PRIORITY_COLORS[inquiry.priority as keyof typeof PRIORITY_COLORS]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
        <h1 className="text-[22px] font-bold text-gray-800">문의 관리</h1>
        <div className="w-7" />
      </header>

      <div className="px-5 py-6 space-y-4">
        {/* 문의글 정보 */}
        <Card>
          <CardBody>
            {/* 상태 변경 버튼들 */}
            <div className="mb-4">
              <h3 className="text-[14px] font-medium text-gray-800 mb-2">
                상태 변경
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {STATUSES.map((status) => {
                  const statusConfig =
                    STATUS_COLORS[status as keyof typeof STATUS_COLORS]
                  return (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      className={`px-3 py-2 rounded-full border text-[12px] font-medium whitespace-nowrap ${
                        inquiry.status === status
                          ? 'border-[#EB5A36]'
                          : 'border-gray-300'
                      }`}
                      style={{
                        backgroundColor:
                          inquiry.status === status ? statusConfig?.bg : 'white',
                        color:
                          inquiry.status === status
                            ? statusConfig?.text
                            : '#666',
                      }}
                    >
                      {status}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 우선순위 및 카테고리 */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-3 py-1 rounded-full text-[12px] font-medium"
                style={{
                  backgroundColor: priorityConfig?.bg,
                  color: priorityConfig?.text,
                }}
              >
                {inquiry.priority}
              </span>
              <span className="text-gray-500 text-[12px]">
                {inquiry.category}
              </span>
            </div>

            {/* 제목 */}
            <h2 className="text-[20px] font-bold text-gray-800 mb-3">
              {inquiry.title}
            </h2>

            {/* 메타 정보 */}
            <div className="flex items-center text-gray-500 text-[13px] mb-4">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="mr-4">
                {formatDate(inquiry.created_at)} {formatTime(inquiry.created_at)}
              </span>
              {inquiry.stores?.name && (
                <>
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{inquiry.stores.name}</span>
                </>
              )}
            </div>

            {/* 문의 내용 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 text-[15px] leading-6 whitespace-pre-wrap">
                {inquiry.content}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* 답변 목록 */}
        <Card>
          <CardBody>
            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 text-gray-800 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-[18px] font-bold text-gray-800">
                답변 ({inquiry.inquiry_responses.length})
              </h3>
            </div>

            {inquiry.inquiry_responses.length > 0 && (
              <div className="space-y-4">
                {inquiry.inquiry_responses.map((response) => (
                  <div key={response.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
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
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-[#EB5A36] font-medium text-[14px]">
                          관리자
                        </span>
                      </div>
                      <span className="text-gray-500 text-[12px]">
                        {formatDate(response.created_at)}{' '}
                        {formatTime(response.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-[15px] leading-6 whitespace-pre-wrap">
                      {response.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* 답변 작성 영역 */}
        <Card>
          <CardBody>
            <h3 className="text-[16px] font-medium text-gray-800 mb-3">
              답변 작성
            </h3>
            <div className="space-y-3">
              <div>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="답변을 입력해주세요..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[15px] text-gray-800 min-h-[100px] resize-none"
                  maxLength={1000}
                />
                <p className="text-gray-500 text-[12px] mt-1 text-right">
                  {responseText.length}/1000
                </p>
              </div>
              <Button
                onClick={submitResponse}
                disabled={submitting || !responseText.trim()}
                fullWidth
                className={
                  submitting || !responseText.trim()
                    ? 'bg-[#FADCD2] hover:bg-[#FADCD2]'
                    : ''
                }
              >
                {submitting ? '등록 중...' : '답변 등록'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default function AdminInquiryDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EB5A36]" /></div>}>
      <AdminInquiryDetailContent />
    </Suspense>
  )
}
