'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

interface ScrollPickerProps {
  items: { value: string | number; label: string }[]
  value: string | number
  onChange: (value: string | number) => void
  itemHeight?: number
}

export default function ScrollPicker({
  items,
  value,
  onChange,
  itemHeight = 36,
}: ScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const visibleItems = 3
  const containerHeight = itemHeight * visibleItems
  const paddingItems = Math.floor(visibleItems / 2)

  // 현재 값의 인덱스 찾기
  const currentIndex = items.findIndex((item) => item.value === value)

  // 스크롤 위치를 값에 맞게 설정
  const scrollToIndex = useCallback(
    (index: number, smooth = true) => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: index * itemHeight,
          behavior: smooth ? 'smooth' : 'auto',
        })
      }
    },
    [itemHeight]
  )

  // 초기 스크롤 위치 설정
  useEffect(() => {
    if (currentIndex >= 0) {
      scrollToIndex(currentIndex, false)
    }
  }, [])

  // 값이 외부에서 변경되었을 때 스크롤 위치 업데이트
  useEffect(() => {
    if (!isScrolling && currentIndex >= 0) {
      scrollToIndex(currentIndex, true)
    }
  }, [value, currentIndex, isScrolling, scrollToIndex])

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    setIsScrolling(true)

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return

      const scrollTop = containerRef.current.scrollTop
      const nearestIndex = Math.round(scrollTop / itemHeight)
      const clampedIndex = Math.max(0, Math.min(nearestIndex, items.length - 1))

      scrollToIndex(clampedIndex, true)

      const newValue = items[clampedIndex]?.value
      if (newValue !== undefined && newValue !== value) {
        onChange(newValue)
      }

      setIsScrolling(false)
    }, 100)
  }, [items, itemHeight, onChange, value, scrollToIndex])

  // 아이템 클릭 핸들러
  const handleItemClick = (index: number) => {
    scrollToIndex(index, true)
    const newValue = items[index]?.value
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {/* 선택 영역 하이라이트 */}
      <div
        className="absolute left-0 right-0 bg-white rounded-lg pointer-events-none"
        style={{
          top: paddingItems * itemHeight,
          height: itemHeight,
          zIndex: 1,
        }}
      />

      {/* 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto scrollbar-hide"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          zIndex: 2,
        }}
        onScroll={handleScroll}
      >
        {/* 상단 패딩 */}
        <div style={{ height: paddingItems * itemHeight }} />

        {/* 아이템들 */}
        {items.map((item, index) => {
          const isSelected = item.value === value
          return (
            <div
              key={`${item.value}-${index}`}
              className={`flex items-center justify-center cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'text-[#EB5A36] font-bold'
                  : 'text-gray-400'
              }`}
              style={{
                height: itemHeight,
                scrollSnapAlign: 'center',
                fontSize: isSelected ? '15px' : '14px',
              }}
              onClick={() => handleItemClick(index)}
            >
              {item.label}
            </div>
          )
        })}

        {/* 하단 패딩 */}
        <div style={{ height: paddingItems * itemHeight }} />
      </div>

      {/* 상단 그라데이션 */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: paddingItems * itemHeight,
          background: 'linear-gradient(to bottom, rgb(249 250 251), transparent)',
          zIndex: 3,
        }}
      />

      {/* 하단 그라데이션 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: paddingItems * itemHeight,
          background: 'linear-gradient(to top, rgb(249 250 251), transparent)',
          zIndex: 3,
        }}
      />
    </div>
  )
}
