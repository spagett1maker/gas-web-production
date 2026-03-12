'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'
import { Modal } from '@/components/ui/Modal'
import { Search, Eye, RefreshCw, Mail, Phone, MapPin, Calendar, Users as UsersIcon } from 'lucide-react'

interface User {
  id: string
  email: string
  phone: string
  created_at: string
}

interface Store {
  id: string
  name: string
  address: string
  created_at: string
}

interface ServiceRequest {
  id: string
  status: string
  created_at: string
  services?: { name: string }
  stores?: { name: string }
}

function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [userStores, setUserStores] = useState<Store[]>([])
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, phone, created_at')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setUsers(data as User[])
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 검색 필터
  useEffect(() => {
    let filtered = users

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const openDetailModal = async (user: User) => {
    setSelectedUser(user)

    // 사용자의 가게 목록 가져오기
    const { data: storesData } = await supabase
      .from('stores')
      .select('id, name, address, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setUserStores(storesData as Store[] || [])

    // 사용자의 서비스 요청 내역 가져오기
    const storeIds = (storesData || []).map(s => s.id)

    if (storeIds.length > 0) {
      const { data: requestsData } = await supabase
        .from('service_requests')
        .select(`
          id,
          status,
          created_at,
          services(name),
          stores(name)
        `)
        .in('store_id', storeIds)
        .order('created_at', { ascending: false })

      // 배열을 단일 객체로 변환
      const enrichedRequests = (requestsData || []).map(request => ({
        ...request,
        services: Array.isArray(request.services) ? request.services[0] : request.services,
        stores: Array.isArray(request.stores) ? request.stores[0] : request.stores,
      }))

      setUserRequests(enrichedRequests as ServiceRequest[])
    } else {
      setUserRequests([])
    }

    setShowDetailModal(true)
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">사용자 관리</h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">
              총 <span className="font-semibold text-[#111827]">{users.length}</span>명의 사용자가 등록되어 있습니다.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EB5B37] text-white text-[14px] font-medium rounded-lg hover:bg-[#D94F2E] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {/* Search Bar */}
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="이메일 또는 연락처로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-[14px] text-[#111827] placeholder-[#9CA3AF] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB5B37]/20 focus:border-[#EB5B37] transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-7 h-7 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-3">
                <UsersIcon className="h-6 w-6 text-[#9CA3AF]" />
              </div>
              <p className="text-[14px] text-[#6B7280]">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-5 py-3 text-left text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-5 py-3 text-left text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-5 py-3 text-left text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-5 py-3 text-right text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      {/* 사용자 */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#FEF2EE] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[#EB5B37] font-semibold text-[13px]">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-[#111827] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 연락처 */}
                      <td className="px-5 py-4">
                        <span className="text-[14px] text-[#374151]">
                          {user.phone || '-'}
                        </span>
                      </td>

                      {/* 가입일 */}
                      <td className="px-5 py-4">
                        <span className="text-[14px] text-[#6B7280]">
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      {/* 액션 */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openDetailModal(user)}
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
          {!loading && filteredUsers.length > 0 && (
            <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <p className="text-[13px] text-[#6B7280]">
                {searchTerm
                  ? `검색 결과: ${filteredUsers.length}명`
                  : `전체 ${filteredUsers.length}명`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedUser(null)
            setUserStores([])
            setUserRequests([])
          }}
          title="사용자 상세 정보"
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">기본 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <div>
                    <p className="text-[12px] text-[#6B7280]">이메일</p>
                    <p className="text-[14px] font-medium text-[#111827]">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <div>
                    <p className="text-[12px] text-[#6B7280]">연락처</p>
                    <p className="text-[14px] font-medium text-[#111827]">{selectedUser.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <div>
                    <p className="text-[12px] text-[#6B7280]">가입일</p>
                    <p className="text-[14px] font-medium text-[#111827]">
                      {new Date(selectedUser.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 등록된 가게 */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">등록된 가게</h3>
              {userStores.length === 0 ? (
                <p className="text-[14px] text-[#9CA3AF] text-center py-6">등록된 가게가 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userStores.map((store) => (
                    <div key={store.id} className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <p className="text-[14px] font-medium text-[#111827]">{store.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3 text-[#9CA3AF]" />
                        <p className="text-[13px] text-[#6B7280]">{store.address}</p>
                      </div>
                      <p className="text-[12px] text-[#9CA3AF] mt-1">
                        등록일: {new Date(store.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 서비스 요청 내역 */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">서비스 요청 내역</h3>
              {userRequests.length === 0 ? (
                <p className="text-[14px] text-[#9CA3AF] text-center py-6">서비스 요청 내역이 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                      <div>
                        <p className="text-[14px] font-medium text-[#111827]">
                          {request.services?.name || '알 수 없는 서비스'}
                        </p>
                        <p className="text-[13px] text-[#6B7280]">
                          {request.stores?.name || '알 수 없는 가게'}
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
              )}
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-7 h-7 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    }>
      <UsersPageContent />
    </Suspense>
  )
}
