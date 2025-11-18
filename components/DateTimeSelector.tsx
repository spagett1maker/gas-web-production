'use client'

import { useState } from 'react'

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
  // 오늘 날짜를 최소값으로 설정
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[15px] font-semibold text-gray-800 mb-2">
          방문 희망 날짜
        </label>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EB5A36] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-[15px] font-semibold text-gray-800 mb-2">
          방문 희망 시간
        </label>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[15px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EB5A36] focus:border-transparent"
        />
      </div>

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
              선택하신 날짜와 시간은 희망 시간이며, 실제 방문 시간은 담당자와 조율 후 확정됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
