'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Search, Eye, RefreshCw, MapPin, Phone, User } from 'lucide-react'

interface Store {
  id: string
  name: string
  address: string
  created_at: string
  user_id: string
  profiles?: { phone: string; email: string }
}

interface ServiceRequest {
  id: string
  status: string
  created_at: string
  services?: { name: string }
}

function StoresPageContent() {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [storeRequests, setStoreRequests] = useState<ServiceRequest[]>([])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          id,
          name,
          address,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('가게 정보 로드 에러:', error)
        setStores([])
      } else if (data) {
        // user_id로 profiles 정보 가져오기
        const userIds = [...new Set(data.map(s => s.user_id))]
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, phone, email')
          .in('id', userIds)

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || [])

        const enrichedData = data.map(store => ({
          ...store,
          profiles: profilesMap.get(store.user_id)
        }))

        setStores(enrichedData as Store[])
      }
    } catch (error) {
      console.error('가게 정보 로드 실패:', error)
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  // 검색 필터
  useEffect(() => {
    let filtered = stores

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(store =>
        store.name?.toLowerCase().includes(term) ||
        store.address?.toLowerCase().includes(term) ||
        store.profiles?.phone?.includes(term)
      )
    }

    setFilteredStores(filtered)
  }, [stores, searchTerm])

  // 날짜별 그룹화
  const groupedStores = filteredStores.reduce((acc, store) => {
    const date = formatDate(store.created_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(store)
    return acc
  }, {} as Record<string, Store[]>)

  const openDetailModal = async (store: Store) => {
    setSelectedStore(store)

    // 가게의 서비스 요청 내역 가져오기
    const { data } = await supabase
      .from('service_requests')
      .select('id, status, created_at, services(name)')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    // 배열을 단일 객체로 변환
    const enrichedRequests = (data || []).map(request => ({
      ...request,
      services: Array.isArray(request.services) ? request.services[0] : request.services,
    }))

    setStoreRequests(enrichedRequests as ServiceRequest[])
    setShowDetailModal(true)
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">가게 관리</h1>
            <p className="mt-2 text-gray-600">등록된 가게 정보를 확인하고 관리하세요.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={fetchStores}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>

        {/* 검색 */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="가게명, 주소 또는 연락처로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full text-gray-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* 가게 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedStores).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              Object.keys(groupedStores).map(date => (
                <div key={date} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {date}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupedStores[date].map((store) => (
                      <Card key={store.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="text-lg font-semibold text-gray-900 flex-1">
                                {store.name}
                              </h4>
                              <button
                                onClick={() => openDetailModal(store)}
                                className="flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                상세
                              </button>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2 text-gray-600">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{store.address}</span>
                              </div>

                              {store.profiles?.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <span>{store.profiles.phone}</span>
                                </div>
                              )}

                              {store.profiles?.email && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{store.profiles.email}</span>
                                </div>
                              )}
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

      {/* Detail Modal */}
      {showDetailModal && selectedStore && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedStore(null)
            setStoreRequests([])
          }}
          title="가게 상세 정보"
        >
          <div className="space-y-6">
            {/* 가게 정보 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">가게 정보</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">가게명:</span>
                  <span className="text-sm text-gray-900">{selectedStore.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">주소:</span>
                  <span className="text-sm text-gray-900">{selectedStore.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">등록일:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedStore.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 등록 유저 정보 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">등록 유저 정보</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">연락처:</span>
                  <span className="text-sm text-gray-900 font-medium">{selectedStore.profiles?.phone || '-'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">이메일:</span>
                  <span className="text-sm text-gray-900">{selectedStore.profiles?.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* 서비스 요청 내역 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">서비스 요청 내역</h3>
              {storeRequests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">서비스 요청 내역이 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {storeRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.services?.name || '알 수 없는 서비스'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === '완료' ? 'bg-emerald-100 text-emerald-700' :
                        request.status === '진행중' ? 'bg-amber-100 text-amber-700' :
                        request.status === '취소' ? 'bg-slate-100 text-slate-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default function StoresPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </AdminLayout>
    }>
      <StoresPageContent />
    </Suspense>
  )
}
