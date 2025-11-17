// 전화번호 포맷팅
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''

  // +82 형식을 0으로 변환
  const cleaned = phone.replace(/\+82\s*/, '0').replace(/\D/g, '')

  // 010-1234-5678 형식으로 변환
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }

  return phone
}

// 국제 전화번호 형식으로 변환 (+82)
export function toInternational(phone: string): string {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('010')) {
    return `+82 ${cleaned.slice(1)}`
  }

  return phone
}

// 날짜 포맷팅
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 날짜를 "오늘", "어제" 등으로 표시
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '오늘'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '어제'
  }

  return formatDate(dateString)
}

// 가격 포맷팅 (1000 -> 1,000원)
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

// 시간 포맷팅 (HH:MM)
export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}
