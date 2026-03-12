'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { formatDate, formatTime } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Search, Eye, RefreshCw } from 'lucide-react'

const CATEGORIES = ['전체', '요청됨', '진행중', '완료', '취소']

interface ServiceRequest {
  id: string
  status: string
  created_at: string
  working_at?: string
  completed_at?: string
  canceled_at?: string
  store_id: string
  service_id: string
  user_id: string
  stores?: { id: string; name: string; address: string }
  services?: { name: string }
  profiles?: { phone: string }
}

function ServicesPageContent() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [searchTerm, setSearchTerm] = useState('')

  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id,
          status,
          created_at,
          working_at,
          completed_at,
          canceled_at,
          store_id,
          service_id,
          user_id,
          stores(id, name, address),
          services(name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('서비스 요청 로드 에러:', error)
        setRequests([])
      } else if (data) {
        // user_id로 profiles 정보 가져오기
        const userIds = [...new Set(data.map(r => r.user_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, phone')
          .in('id', userIds)

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || [])

        const enrichedData = data.map(request => ({
          ...request,
          stores: Array.isArray(request.stores) ? request.stores[0] : request.stores,
          services: Array.isArray(request.services) ? request.services[0] : request.services,
          profiles: profilesMap.get(request.user_id)
        }))

        setRequests(enrichedData as ServiceRequest[])
      }
    } catch (error) {
      console.error('서비스 요청 로드 실패:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // URL 파라미터로 필터 설정
  useEffect(() => {
    if (statusFilter && CATEGORIES.includes(statusFilter)) {
      setSelectedCategory(statusFilter)
    }
  }, [statusFilter])

  // 필터링 로직
  useEffect(() => {
    let filtered = requests

    // 카테고리 필터
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(request => request.status === selectedCategory)
    }

    // 검색 필터
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(request =>
        request.stores?.name?.toLowerCase().includes(term) ||
        SERVICE_NAME_MAP[request.services?.name || '']?.toLowerCase().includes(term)
      )
    }

    setFilteredRequests(filtered)
  }, [requests, selectedCategory, searchTerm])

  const getCategoryCount = (category: string) => {
    if (category === '전체') return requests.length
    return requests.filter(r => r.status === category).length
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">서비스 관리</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              전체 {requests.length}건의 서비스 요청을 관리합니다.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EB5B37] text-white text-sm font-medium rounded-lg hover:bg-[#D4522F] disabled:opacity-50 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* Filters + Search */}
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#EB5B37] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                  }`}
                >
                  {category}
                  <span className={`ml-1.5 text-xs ${
                    selectedCategory === category ? 'text-white/80' : 'text-[#9CA3AF]'
                  }`}>
                    {getCategoryCount(category)}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="가게명 또는 서비스명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#EB5B37]/20 focus:border-[#EB5B37] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-[#9CA3AF]">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      서비스
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      가게
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                      주소
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                      연락처
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      상태
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">
                      요청일
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#111827]">
                          {SERVICE_NAME_MAP[request.services?.name || ''] || request.services?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#111827]">
                          {request.stores?.name || '알 수 없음'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-[#6B7280] max-w-[240px] truncate block">
                          {request.stores?.address || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-[#6B7280]">
                          {request.profiles?.phone || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="text-sm text-[#111827]">
                          {formatDate(request.created_at)}
                        </div>
                        <div className="text-xs text-[#9CA3AF]">
                          {formatTime(request.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/dashboard/services/detail?id=${request.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#EB5B37] hover:bg-[#FEF2EE] rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">상세</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer with count */}
          {!loading && filteredRequests.length > 0 && (
            <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <p className="text-xs text-[#9CA3AF]">
                총 {filteredRequests.length}건
                {selectedCategory !== '전체' && ` (${selectedCategory} 필터 적용)`}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    }>
      <ServicesPageContent />
    </Suspense>
  )
}
