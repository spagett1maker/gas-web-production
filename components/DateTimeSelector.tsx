'use client'

import { useState, useMemo } from 'react'
import ScrollPicker from './ScrollPicker'

interface DateTimeSelectorProps {
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  selectedDate?: string
  selectedTime?: string
}

export default function DateTimeSelector({
  onDateChange,
  onTimeChange,
  selectedDate = '',
  selectedTime = '',
}: DateTimeSelectorProps) {
  const today = new Date()

  // 날짜 파싱
  const parsedDate = selectedDate ? new Date(selectedDate) : today
  const [year, setYear] = useState(parsedDate.getFullYear())
  const [month, setMonth] = useState(parsedDate.getMonth() + 1)
  const [day, setDay] = useState(parsedDate.getDate())

  // 시간 파싱
  const [hour, minute] = selectedTime
    ? selectedTime.split(':').map(Number)
    : [9, 0]
  const [selectedHour, setSelectedHour] = useState(hour)
  const [selectedMinute, setSelectedMinute] = useState(minute)

  // 년도 옵션 (올해 ~ 내년)
  const yearItems = useMemo(() => {
    const currentYear = today.getFullYear()
    return [
      { value: currentYear, label: `${currentYear}년` },
      { value: currentYear + 1, label: `${currentYear + 1}년` },
    ]
  }, [])

  // 월 옵션
  const monthItems = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}월`,
    }))
  }, [])

  // 일 옵션 (해당 월의 일수에 맞게)
  const dayItems = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}일`,
    }))
  }, [year, month])

  // 시간 옵션 (0시 ~ 23시)
  const hourItems = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      value: i,
      label: `${i}시`,
    }))
  }, [])

  // 분 옵션 (10분 단위)
  const minuteItems = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      value: i * 10,
      label: `${String(i * 10).padStart(2, '0')}분`,
    }))
  }, [])

  // 날짜 변경 핸들러
  const handleDateChange = (
    newYear: number,
    newMonth: number,
    newDay: number
  ) => {
    // 해당 월의 최대 일수 체크
    const maxDay = new Date(newYear, newMonth, 0).getDate()
    const validDay = Math.min(newDay, maxDay)

    setYear(newYear)
    setMonth(newMonth)
    setDay(validDay)

    // YYYY-MM-DD 포맷으로 변환
    const formattedDate = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`
    onDateChange(formattedDate)
  }

  // 시간 변경 핸들러
  const handleTimeChange = (newHour: number, newMinute: number) => {
    setSelectedHour(newHour)
    setSelectedMinute(newMinute)

    // HH:MM 포맷으로 변환
    const formattedTime = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
    onTimeChange(formattedTime)
  }

  return (
    <div className="space-y-6">
      {/* 날짜 선택 */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-800 mb-3">
          방문 희망 날짜
        </label>
        <div className="flex gap-1 bg-gray-50 rounded-xl px-2 py-3">
          <div className="flex-1">
            <ScrollPicker
              items={yearItems}
              value={year}
              onChange={(v) => handleDateChange(v as number, month, day)}
            />
          </div>
          <div className="flex-1">
            <ScrollPicker
              items={monthItems}
              value={month}
              onChange={(v) => handleDateChange(year, v as number, day)}
            />
          </div>
          <div className="flex-1">
            <ScrollPicker
              items={dayItems}
              value={day}
              onChange={(v) => handleDateChange(year, month, v as number)}
            />
          </div>
        </div>
      </div>

      {/* 시간 선택 */}
      <div>
        <label className="block text-[15px] font-semibold text-gray-800 mb-3">
          방문 희망 시간
        </label>
        <div className="flex gap-1 bg-gray-50 rounded-xl px-2 py-3">
          <div className="flex-1">
            <ScrollPicker
              items={hourItems}
              value={selectedHour}
              onChange={(v) => handleTimeChange(v as number, selectedMinute)}
            />
          </div>
          <div className="flex-1">
            <ScrollPicker
              items={minuteItems}
              value={selectedMinute}
              onChange={(v) => handleTimeChange(selectedHour, v as number)}
            />
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="bg-[#FFF1EF] rounded-xl p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-[#EB5A36] mt-0.5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-[13px] text-gray-700">
              선택하신 날짜와 시간은 희망 시간이며, 실제 방문 시간은 담당자와
              조율 후 확정됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
