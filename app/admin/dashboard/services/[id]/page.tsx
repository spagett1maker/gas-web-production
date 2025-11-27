'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ArrowLeft, MapPin, Phone, Calendar, FileText, Clock, Wrench, CheckCircle, XCircle } from 'lucide-react'

interface ServiceRequest {
  id: string
  status: string
  created_at: string
  working_at?: string
  completed_at?: string
  canceled_at?: string
  store_id: string
  service_id: string
  user_id?: string
  stores?: { id: string; name: string; address: string; user_id?: string }
  services?: { name: string }
  profiles?: { phone: string }
}

interface RequestDetail {
  key: string
  value: string
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [requestDetails, setRequestDetails] = useState<RequestDetail[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequestDetail = async () => {
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
          stores(id, name, address, user_id),
          services(name)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('서비스 요청 로드 에러:', error)
        return
      }

      if (data) {
        // stores의 user_id로 profiles 정보 가져오기
        const userId = (data.stores as any)?.user_id
        let profileData = null

        if (userId) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', userId)
            .maybeSingle()

          if (profileError) {
            console.error('프로필 로드 에러:', profileError)
          }

          profileData = profile
        }

        setRequest({
          ...data,
          user_id: userId,
          profiles: profileData
        } as ServiceRequest)

        // 요청 상세 정보 가져오기
        const { data: detailsData } = await supabase
          .from('request_details')
          .select('key, value')
          .eq('request_id', params.id)

        setRequestDetails(detailsData || [])
      }
    } catch (error) {
      console.error('서비스 요청 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequestDetail()
  }, [params.id])

  const updateStatus = async (newStatus: string) => {
    if (!request) return

    const statusFieldMap: Record<string, string> = {
      '진행중': 'working_at',
      '완료': 'completed_at',
      '취소': 'canceled_at',
    }

    const updateData: any = { status: newStatus }
    if (statusFieldMap[newStatus]) {
      updateData[statusFieldMap[newStatus]] = new Date().toISOString()
    }

    const { error } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', request.id)

    if (!error) {
      setRequest({ ...request, status: newStatus })
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!request) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">서비스 요청을 찾을 수 없습니다.</p>
              <Link
                href="/admin/dashboard/services"
                className="inline-flex items-center mt-4 text-orange-600 hover:text-orange-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/dashboard/services"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">서비스 요청 상세</h1>
              <p className="mt-1 text-sm text-gray-600">요청 ID: {request.id}</p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 컬럼 - 주요 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 서비스 정보 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">서비스 정보</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">서비스</label>
                    <p className="mt-1 text-base font-medium text-gray-900">
                      {SERVICE_NAME_MAP[request.services?.name || ''] || request.services?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">요청 시간</label>
                    <div className="mt-1 flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{new Date(request.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                  {request.working_at && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">진행 시작</label>
                      <div className="mt-1 flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{new Date(request.working_at).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>
                  )}
                  {request.completed_at && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">완료 시간</label>
                      <div className="mt-1 flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{new Date(request.completed_at).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>
                  )}
                  {request.canceled_at && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">취소 시간</label>
                      <div className="mt-1 flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{new Date(request.canceled_at).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 가게 정보 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">가게 정보</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{request.stores?.name || '알 수 없는 가게'}</p>
                      <p className="text-sm text-gray-600 mt-1">{request.stores?.address || '-'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 요청 상세 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">요청 상세</h2>
              </CardHeader>
              <CardContent>
                {requestDetails.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">상세 정보가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {requestDetails.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{detail.key}</p>
                          <p className="text-sm text-gray-900 mt-1">{detail.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 컬럼 - 고객 정보 & 상태 변경 */}
          <div className="space-y-6">
            {/* 고객 정보 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">고객 정보</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Phone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">연락처</p>
                    <p className="text-base font-semibold text-gray-900">{request.profiles?.phone || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 현재 상태 및 변경 */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">요청 처리</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 현재 상태 강조 */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">현재 상태</p>
                    <div className="flex items-center gap-3">
                      {request.status === '요청됨' && (
                        <>
                          <div className="bg-blue-500 p-2.5 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-blue-700">요청됨</p>
                            <p className="text-xs text-gray-600 mt-0.5">처리 대기 중</p>
                          </div>
                        </>
                      )}
                      {request.status === '진행중' && (
                        <>
                          <div className="bg-amber-500 p-2.5 rounded-lg">
                            <Wrench className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-amber-700">진행중</p>
                            <p className="text-xs text-gray-600 mt-0.5">작업 진행 중</p>
                          </div>
                        </>
                      )}
                      {request.status === '완료' && (
                        <>
                          <div className="bg-emerald-500 p-2.5 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-emerald-700">완료</p>
                            <p className="text-xs text-gray-600 mt-0.5">작업 완료됨</p>
                          </div>
                        </>
                      )}
                      {request.status === '취소' && (
                        <>
                          <div className="bg-slate-500 p-2.5 rounded-lg">
                            <XCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-slate-700">취소</p>
                            <p className="text-xs text-gray-600 mt-0.5">요청 취소됨</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 상태 변경 액션 */}
                  {request.status !== '완료' && request.status !== '취소' && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">상태 변경</p>
                      <div className="space-y-2">
                        {request.status === '요청됨' && (
                          <>
                            <button
                              onClick={() => updateStatus('진행중')}
                              className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <Wrench className="h-4 w-4" />
                              작업 시작하기
                            </button>
                            <button
                              onClick={() => updateStatus('취소')}
                              className="w-full px-4 py-3 bg-white border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 hover:border-red-400 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              요청 취소
                            </button>
                          </>
                        )}
                        {request.status === '진행중' && (
                          <>
                            <button
                              onClick={() => updateStatus('완료')}
                              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              작업 완료 처리
                            </button>
                            <button
                              onClick={() => updateStatus('요청됨')}
                              className="w-full px-4 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              대기 상태로 변경
                            </button>
                            <button
                              onClick={() => updateStatus('취소')}
                              className="w-full px-4 py-3 bg-white border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 hover:border-red-400 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              요청 취소
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 완료/취소 상태일 때 다른 상태로 변경 */}
                  {(request.status === '완료' || request.status === '취소') && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">상태 되돌리기</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => updateStatus('요청됨')}
                          className="w-full px-4 py-3 bg-white border-2 border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          요청됨으로 변경
                        </button>
                        <button
                          onClick={() => updateStatus('진행중')}
                          className="w-full px-4 py-3 bg-white border-2 border-amber-300 text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Wrench className="h-4 w-4" />
                          진행중으로 변경
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
