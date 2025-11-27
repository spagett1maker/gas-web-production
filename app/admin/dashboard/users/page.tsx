'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Search, Eye, RefreshCw, Mail, Phone, MapPin, Calendar } from 'lucide-react'

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

  // 날짜별 그룹화
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const date = formatDate(user.created_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(user)
    return acc
  }, {} as Record<string, User[]>)

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
      <div className="p-6 space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
            <p className="mt-2 text-gray-600">등록된 사용자 정보를 확인하고 관리하세요.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={fetchUsers}
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
                placeholder="이메일 또는 연락처로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full text-gray-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedUsers).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              Object.keys(groupedUsers).map(date => (
                <div key={date} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    {date}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupedUsers[date].map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-semibold text-sm">
                                      {user.email?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => openDetailModal(user)}
                                className="flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                상세
                              </button>
                            </div>

                            <div className="space-y-2 text-sm">
                              {user.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <span>{user.phone}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>{formatDate(user.created_at)}</span>
                              </div>
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
        >
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">기본 정보</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">이메일:</span>
                  <span className="text-sm text-gray-900">{selectedUser.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">연락처:</span>
                  <span className="text-sm text-gray-900">{selectedUser.phone || '-'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 min-w-[60px]">가입일:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 등록된 가게 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">등록된 가게</h3>
              {userStores.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">등록된 가게가 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userStores.map((store) => (
                    <div key={store.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{store.address}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        등록일: {new Date(store.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 서비스 요청 내역 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">서비스 요청 내역</h3>
              {userRequests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">서비스 요청 내역이 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.services?.name || '알 수 없는 서비스'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.stores?.name || '알 수 없는 가게'}
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

export default function UsersPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </AdminLayout>
    }>
      <UsersPageContent />
    </Suspense>
  )
}
