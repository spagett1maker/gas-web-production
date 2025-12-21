'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { formatDate, formatTime, getServiceIcon } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
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

  // 날짜별 그룹화
  const groupedRequests = filteredRequests.reduce((acc, request) => {
    const date = formatDate(request.created_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(request)
    return acc
  }, {} as Record<string, ServiceRequest[]>)

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
            <p className="mt-2 text-gray-600">가스 서비스 요청을 관리하고 처리하세요.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* 카테고리 필터 */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* 검색창 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="가게명 또는 서비스명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-80 text-gray-900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 서비스 요청 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedRequests).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              Object.keys(groupedRequests).map(date => (
                <div key={date} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {date}
                  </h3>
                  <div className="grid gap-4">
                    {groupedRequests[date].map((request) => (
                      <Card key={request.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              {/* <div className="text-2xl">
                                {getServiceIcon(request.services?.name || '')}
                              </div> */}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {request.stores?.name || '알 수 없는 가게'}
                                  </h4>
                                  <StatusBadge status={request.status} />
                                  <p className="text-xs font-bold border p-1 px-2 rounded-full bg-gray-50 text-black">
                                    {SERVICE_NAME_MAP[request.services?.name || ''] || request.services?.name}
                                  </p>
                                </div>
                                {/* <p className="text-sm text-gray-600 mb-1">
                                  {SERVICE_NAME_MAP[request.services?.name || ''] || request.services?.name}
                                </p> */}
                                <p className="text-xs text-gray-500">
                                  {request.stores?.address}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {formatTime(request.created_at)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {request.profiles?.phone || '-'}
                                </p>
                              </div>
                              <Link
                                href={`/admin/dashboard/services/detail?id=${request.id}`}
                                className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                상세
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </AdminLayout>
    }>
      <ServicesPageContent />
    </Suspense>
  )
}
