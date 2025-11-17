'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Script from 'next/script'

declare global {
  interface Window {
    kakao: any
  }
}

const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || ''

export default function AddStorePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapRef = useRef<any>(null)
  const mapMarkerRef = useRef<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // 카카오맵 SDK가 로드되면 지도 초기화
    if (mapLoaded && window.kakao && window.kakao.maps) {
      initMap()
    }
  }, [mapLoaded])

  const initMap = () => {
    const container = document.getElementById('map')
    if (!container) return

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 기본 좌표
      level: 3,
    }

    const map = new window.kakao.maps.Map(container, options)
    mapRef.current = map

    // 지도 클릭 이벤트
    window.kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
      const latlng = mouseEvent.latLng
      const lat = latlng.getLat()
      const lng = latlng.getLng()

      setMarker({ lat, lng })
      updateMarker(lat, lng)
      reverseGeocode(lat, lng)
    })
  }

  const updateMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return

    // 기존 마커 제거
    if (mapMarkerRef.current) {
      mapMarkerRef.current.setMap(null)
    }

    // 새 마커 생성
    const markerPosition = new window.kakao.maps.LatLng(lat, lng)
    const newMarker = new window.kakao.maps.Marker({
      position: markerPosition,
    })

    newMarker.setMap(mapRef.current)
    mapMarkerRef.current = newMarker

    // 지도 중심 이동
    mapRef.current.setCenter(markerPosition)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
        {
          headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
        }
      )
      const json = await res.json()
      const addressName =
        json.documents?.[0]?.road_address?.address_name ||
        json.documents?.[0]?.address?.address_name
      if (addressName) setAddress(addressName)
    } catch (e) {
      console.warn('역지오코딩 실패:', e)
    }
  }

  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<F>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  const searchPlaces = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword.trim()) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        // 키워드 검색
        const res = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`,
          {
            headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
          }
        )
        const json = await res.json()
        const results = json.documents || []

        if (results.length === 0) {
          // 주소 검색
          const addrRes = await fetch(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(keyword)}`,
            {
              headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
            }
          )
          const addrJson = await addrRes.json()
          const first = addrJson.documents?.[0]

          if (first) {
            const lat = parseFloat(first.y)
            const lng = parseFloat(first.x)
            setMarker({ lat, lng })
            setAddress(first.address?.address_name || keyword)
            updateMarker(lat, lng)

            setSearchResults([
              {
                id: 'address_result',
                place_name: first.address?.address_name || keyword,
                road_address_name: '',
                address_name: first.address?.address_name || keyword,
                phone: '',
                x: first.x,
                y: first.y,
              },
            ])
          } else {
            setSearchResults([])
          }
        } else {
          setSearchResults(results)
        }
      } catch (e) {
        console.warn('검색 실패:', e)
      }
      setLoading(false)
    }, 400),
    [mapLoaded]
  )

  const handleAddressChange = (text: string) => {
    setAddress(text)
    searchPlaces(text)
  }

  const handleSelectStore = (item: any) => {
    const fullAddress = item.road_address_name || item.address_name
    setName(item.place_name)
    setAddress(fullAddress)

    const lat = parseFloat(item.y)
    const lng = parseFloat(item.x)
    setMarker({ lat, lng })
    updateMarker(lat, lng)

    setSearchResults([
      {
        ...item,
        id: 'selected_result',
      },
    ])
  }

  const saveStore = async () => {
    if (!name.trim() || !address.trim()) {
      alert('가게 이름과 주소를 입력해주세요.')
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
        address,
      })

    if (error) {
      alert('가게 저장에 실패했습니다: ' + error.message)
      return
    }

    router.push('/profile/my-store')
  }

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_REST_API_KEY}&autoload=false`}
        onLoad={() => {
          window.kakao.maps.load(() => setMapLoaded(true))
        }}
      />

      <div className="min-h-screen bg-white flex flex-col">
        {/* 상단 헤더 */}
        <header className="pt-6 pb-4 px-5 flex items-center justify-between bg-white border-b border-gray-200 z-20">
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
          <h1 className="text-[22px] font-bold text-gray-800">나의 가게</h1>
          <div className="w-7" />
        </header>

        {/* 지도 */}
        <div id="map" className="w-full h-[300px] flex-shrink-0" />

        {/* 위치 정보 입력 영역 */}
        <div className="flex-1 bg-white px-6 pt-6 pb-24 overflow-y-auto">
          <h2 className="font-bold text-[18px] mb-4 text-center text-gray-800">
            위치 정보
          </h2>

          <div className="mb-4">
            <Input
              type="text"
              placeholder="가게 위치 (주소 검색)"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
            />
          </div>

          {/* 검색 결과 */}
          <div className="mb-4 max-h-[200px] overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  className="w-full border-b border-gray-200 py-3 px-4 bg-white hover:bg-gray-50 text-left"
                  onClick={() => handleSelectStore(item)}
                >
                  <p className="font-bold text-base text-gray-800">
                    {item.place_name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {item.road_address_name || item.address_name}
                  </p>
                  {item.phone && (
                    <p className="text-xs text-gray-400">{item.phone}</p>
                  )}
                </button>
              ))
            ) : (
              !loading && address.trim() !== '' && (
                <p className="text-center text-gray-400 mt-8">
                  검색 결과가 없습니다.
                </p>
              )
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EB5A36]" />
            </div>
          )}
        </div>

        {/* 저장 버튼 고정 */}
        <div className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-white border-t border-gray-200">
          <Button
            onClick={saveStore}
            disabled={!name.trim() || !address.trim()}
            fullWidth
            className={
              !name.trim() || !address.trim()
                ? 'bg-[#FADCD2] hover:bg-[#FADCD2]'
                : ''
            }
          >
            저장
          </Button>
        </div>
      </div>
    </>
  )
}
