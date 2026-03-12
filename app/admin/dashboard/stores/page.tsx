'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'
import { Modal } from '@/components/ui/Modal'
import { Search, Eye, RefreshCw, Store, MapPin, Phone, Mail, Calendar } from 'lucide-react'

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
      <div className="p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">가게 관리</h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              등록된 가게 {stores.length}개
            </p>
          </div>
          <button
            onClick={fetchStores}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EB5B37] text-white text-[14px] font-medium rounded-lg hover:bg-[#D4502F] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="가게명, 주소 또는 연락처로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-[14px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#EB5B37]/20 focus:border-[#EB5B37] transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-7 h-7 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
              <Store className="h-10 w-10 mb-3" strokeWidth={1.5} />
              <p className="text-[15px] font-medium text-[#6B7280]">
                {searchTerm ? '검색 결과가 없습니다' : '등록된 가게가 없습니다'}
              </p>
              {searchTerm && (
                <p className="mt-1 text-[13px] text-[#9CA3AF]">다른 검색어를 시도해보세요</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      가게명
                    </th>
                    <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      주소
                    </th>
                    <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="text-left px-6 py-3.5 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      등록일
                    </th>
                    <th className="text-right px-6 py-3.5 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredStores.map((store) => (
                    <tr
                      key={store.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#FEF2EE] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store className="h-4 w-4 text-[#EB5B37]" strokeWidth={2} />
                          </div>
                          <span className="text-[14px] font-medium text-[#111827]">
                            {store.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-[#6B7280]">
                          {store.address || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-[#6B7280]">
                          {store.profiles?.phone || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-[#6B7280] truncate block max-w-[200px]">
                          {store.profiles?.email || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-[#6B7280]">
                          {formatDate(store.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetailModal(store)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#EB5B37] hover:bg-[#FEF2EE] rounded-md transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {!loading && filteredStores.length > 0 && (
            <div className="px-6 py-3.5 bg-[#F9FAFB] border-t border-[#E5E7EB]">
              <p className="text-[13px] text-[#9CA3AF]">
                총 <span className="font-medium text-[#6B7280]">{filteredStores.length}</span>개의 가게
                {searchTerm && stores.length !== filteredStores.length && (
                  <span> (전체 {stores.length}개 중)</span>
                )}
              </p>
            </div>
          )}
        </div>
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
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* 가게 정보 */}
            <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
                가게 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Store className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <span className="text-[14px] font-medium text-[#111827]">{selectedStore.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
                  <span className="text-[14px] text-[#374151]">{selectedStore.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <span className="text-[14px] text-[#374151]">
                    {new Date(selectedStore.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 등록 유저 정보 */}
            <div className="p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
                등록 유저 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <span className="text-[14px] font-medium text-[#111827]">
                    {selectedStore.profiles?.phone || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <span className="text-[14px] text-[#374151]">
                    {selectedStore.profiles?.email || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 서비스 요청 내역 */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
                서비스 요청 내역
              </h3>
              {storeRequests.length === 0 ? (
                <div className="py-8 text-center bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                  <p className="text-[14px] text-[#9CA3AF]">서비스 요청 내역이 없습니다</p>
                </div>
              ) : (
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#E5E7EB]">
                    {storeRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors"
                      >
                        <div>
                          <p className="text-[14px] font-medium text-[#111827]">
                            {request.services?.name || '알 수 없는 서비스'}
                          </p>
                          <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                            {new Date(request.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${
                          request.status === '완료' ? 'bg-[#ECFDF5] text-[#059669]' :
                          request.status === '진행중' ? 'bg-[#FFFBEB] text-[#D97706]' :
                          request.status === '취소' ? 'bg-[#F3F4F6] text-[#6B7280]' :
                          'bg-[#EFF6FF] text-[#2563EB]'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-7 h-7 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    }>
      <StoresPageContent />
    </Suspense>
  )
}
