'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, X, Search } from 'lucide-react'

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || ''

export default function AddStorePage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [name, setName] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // 검색 관련
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const isDemo = localStorage.getItem('demo_mode') === 'true'
    if (isDemo) {
      setIsDemoMode(true)
      return
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
      }
    }
    checkAuth()
  }, [router])

  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<F>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchPlaces = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword.trim()) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        // 키워드 검색
        const res = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`,
          { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
        )
        const json = await res.json()
        let results = json.documents || []

        if (results.length === 0) {
          // 주소 검색 fallback
          const addrRes = await fetch(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(keyword)}`,
            { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
          )
          const addrJson = await addrRes.json()
          results = (addrJson.documents || []).map((doc: any) => ({
            id: doc.address?.address_name || doc.road_address?.address_name,
            place_name: doc.road_address?.address_name || doc.address?.address_name || keyword,
            road_address_name: doc.road_address?.address_name || '',
            address_name: doc.address?.address_name || '',
            x: doc.x,
            y: doc.y,
          }))
        }

        setSearchResults(results)
      } catch (e) {
        console.warn('검색 실패:', e)
      }
      setSearchLoading(false)
    }, 400),
    []
  )

  const handleSearchInput = (text: string) => {
    setSearchQuery(text)
    searchPlaces(text)
  }

  const handleSelectAddress = (item: any) => {
    const selectedAddress = item.road_address_name || item.address_name || item.place_name
    setAddress(selectedAddress)
    if (item.place_name && item.place_name !== selectedAddress) {
      setName(item.place_name)
    }
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const fullAddress = addressDetail
    ? `${address} ${addressDetail}`
    : address

  const saveStore = async () => {
    if (!name.trim() || !address.trim()) return

    if (isDemoMode) {
      router.push('/home')
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user.id

    if (!userId) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('stores')
      .insert({
        user_id: userId,
        name,
        address: fullAddress,
      })

    if (error) {
      alert('가게 저장에 실패했습니다: ' + error.message)
      return
    }

    router.push('/profile/my-store')
  }

  const isValid = name.trim() && address.trim()

  // 주소 검색 화면
  if (showSearch) {
    return (
      <div className="page-without-tabs bg-white">
        {/* 검색 헤더 */}
        <div className="app-header">
          <div className="h-[48px] px-4 flex items-center gap-3">
            <button
              onClick={() => {
                setShowSearch(false)
                setSearchQuery('')
                setSearchResults([])
              }}
              className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full active:bg-[#F5F5F7] transition-colors"
            >
              <X className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
            </button>
            <span className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
              주소 검색
            </span>
          </div>
        </div>

        <div className="page-content">
          {/* 검색 입력 */}
          <div className="px-5 pt-3 pb-4">
            <div className="h-[48px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4 gap-2.5">
              <Search className="w-[18px] h-[18px] text-[#8E8E93] flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                placeholder="도로명, 건물명 또는 지번 검색"
                autoFocus
                className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
              />
            </div>
          </div>

          {/* 검색 결과 or 검색 예시 */}
          {searchResults.length > 0 ? (
            <div className="px-5">
              {searchResults.map((item, idx) => (
                <button
                  key={item.id || idx}
                  className="w-full py-3.5 border-b border-[#F2F2F7] text-left active:bg-[#F9F9F9] transition-colors"
                  onClick={() => handleSelectAddress(item)}
                >
                  <p className="text-[15px] font-medium text-[#1A1A1A] tracking-[-0.2px]">
                    {item.place_name}
                  </p>
                  {(item.road_address_name || item.address_name) && item.place_name !== (item.road_address_name || item.address_name) && (
                    <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] mt-0.5">
                      {item.road_address_name || item.address_name}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery.trim() && !searchLoading ? (
            <div className="px-5 pt-8 text-center">
              <p className="text-[14px] text-[#C7C7CC] tracking-[-0.2px]">
                검색 결과가 없습니다.
              </p>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="px-5 pt-2">
              <p className="text-[14px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-5">
                검색 예시
              </p>

              <div className="space-y-5">
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A1A] tracking-[-0.2px]">
                    도로명 + 건물번호
                  </p>
                  <p className="text-[13px] text-[#C7C7CC] tracking-[-0.2px] mt-0.5">
                    예) 서초대로
                  </p>
                </div>
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A1A] tracking-[-0.2px]">
                    동/읍/면/리 + 번지
                  </p>
                  <p className="text-[13px] text-[#C7C7CC] tracking-[-0.2px] mt-0.5">
                    예) 서초동 999-999
                  </p>
                </div>
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A1A] tracking-[-0.2px]">
                    건물명/아파트명
                  </p>
                  <p className="text-[13px] text-[#C7C7CC] tracking-[-0.2px] mt-0.5">
                    예) 서초자이아파트
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {searchLoading && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E5E5EA] border-t-[#EB5B37]" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // 메인 폼 화면
  return (
    <div className="page-without-tabs bg-white">
      {/* 헤더 */}
      <div className="app-header">
        <div className="h-[48px] px-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* 타이틀 */}
        <div className="px-5 pt-4 pb-8">
          <h1 className="text-[26px] font-bold text-[#1A1A1A] tracking-[-0.6px] leading-[1.35]">
            서비스 이용을 위해<br />
            주소를 입력해주세요.
          </h1>
        </div>

        {isDemoMode && (
          <div className="mx-5 mb-4 p-3 bg-[#F5F5F7] rounded-[10px]">
            <p className="text-[12px] text-[#8E8E93] tracking-[-0.2px]">
              데모 모드
            </p>
          </div>
        )}

        {/* 주소 */}
        <div className="px-5 mb-5">
          <label className="text-[14px] font-medium text-[#1A1A1A] tracking-[-0.2px] mb-2 block">
            주소
          </label>
          <button
            onClick={() => setShowSearch(true)}
            className="w-full h-[52px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4 gap-2.5 text-left active:bg-[#EBEBED] transition-colors"
          >
            <Search className="w-[18px] h-[18px] text-[#8E8E93] flex-shrink-0" strokeWidth={2} />
            {address ? (
              <span className="text-[15px] text-[#1A1A1A] tracking-[-0.2px] truncate">{address}</span>
            ) : (
              <span className="text-[15px] text-[#C7C7CC] tracking-[-0.2px]">도로명, 건물명 또는 지번 검색</span>
            )}
          </button>
        </div>

        {/* 상세 주소 */}
        <div className="px-5 mb-5">
          <label className="text-[14px] font-medium text-[#1A1A1A] tracking-[-0.2px] mb-2 block">
            상세 주소
          </label>
          <div className="h-[52px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4">
            <input
              type="text"
              value={addressDetail}
              onChange={e => setAddressDetail(e.target.value)}
              placeholder="건물, 아파트, 동/호수 입력"
              className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
            />
          </div>
        </div>

        {/* 가게 이름 */}
        <div className="px-5 mb-5">
          <label className="text-[14px] font-medium text-[#1A1A1A] tracking-[-0.2px] mb-2 block">
            가게 이름
          </label>
          <div className="h-[52px] bg-[#F5F5F7] rounded-[10px] flex items-center px-4">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예) 우리가게"
              className="w-full bg-transparent text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] outline-none tracking-[-0.2px]"
            />
          </div>
        </div>

        <div className="bottom-spacer" />
      </div>

      {/* 다음 버튼 */}
      <div className="page-bottom">
        <button
          onClick={saveStore}
          disabled={!isValid}
          className={`w-full h-[54px] rounded-xl text-[16px] font-semibold tracking-[-0.3px] transition-colors ${
            isValid
              ? 'bg-[#1A1A1A] text-white active:bg-[#333]'
              : 'bg-[#F5F5F7] text-[#C7C7CC]'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  )
}
