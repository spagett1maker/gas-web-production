'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { ADMIN_USER_ID } from '@/lib/constants'

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchInquiries = async () => {
    // 관리자 권한 체크
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== ADMIN_USER_ID) {
      router.push('/')
      return
    }

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
        stores(name),
        profiles(phone)
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      console.warn('문의 목록 로드 실패:', error.message)
    } else {
      setInquiries(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case '접수됨':
        return '#FF9500'
      case '처리중':
        return '#007AFF'
      case '완료':
        return '#34C759'
      case '보류':
        return '#FF3B30'
      default:
        return '#8E8E93'
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
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

      {/* 문의 리스트 */}
      {loading ? (
        <Loading />
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-500 text-base">문의가 없습니다.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {inquiries.map((inquiry) => {
            const storeName = Array.isArray(inquiry.stores)
              ? inquiry.stores[0]?.name
              : inquiry.stores?.name
            const phone = Array.isArray(inquiry.profiles)
              ? inquiry.profiles[0]?.phone
              : inquiry.profiles?.phone

            return (
              <button
                key={inquiry.id}
                onClick={() =>
                  router.push(`/admin/inquiry-detail?id=${inquiry.id}`)
                }
                className="w-full px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-3">
                    <h3 className="font-bold text-base text-gray-800 mb-1 line-clamp-1">
                      {inquiry.title}
                    </h3>
                    <p className="text-gray-600 text-[13px] mb-2 line-clamp-2">
                      {inquiry.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className="px-2 py-1 rounded-full mb-1 text-[11px] font-medium"
                      style={{
                        backgroundColor: getStatusColor(inquiry.status) + '20',
                        color: getStatusColor(inquiry.status),
                      }}
                    >
                      {inquiry.status}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {new Date(inquiry.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 text-xs">{inquiry.category}</span>
                  {storeName && (
                    <span className="text-gray-500 text-xs">🏪 {storeName}</span>
                  )}
                  {phone && (
                    <span className="text-gray-500 text-xs">📞 {phone}</span>
                  )}
                  <span
                    className={`text-xs font-medium ${
                      inquiry.priority === '높음'
                        ? 'text-red-500'
                        : inquiry.priority === '보통'
                        ? 'text-yellow-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {inquiry.priority}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
