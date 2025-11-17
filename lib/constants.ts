// 서비스 타입
export const SERVICES = {
  BURNER: 'burner',
  VALVE: 'valve',
  ALARM: 'alarm',
  GAS: 'gas',
  PIPE: 'pipe',
  QUOTE: 'quote',
  CONTRACT: 'contract',
  CENTER: 'center',
} as const

// 서비스명 매핑
export const SERVICE_NAME_MAP: Record<string, string> = {
  burner: '화구 교체',
  valve: '밸브 교체',
  alarm: '경보기 교체',
  gas: '가스누출 검사',
  pipe: '배관 철거',
  quote: '시공견적 문의',
  contract: '정기계약 이용권',
  center: '고객센터',
}

// 서비스 상태
export const SERVICE_STATUS = {
  REQUESTED: '요청됨',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
} as const

// 문의 카테고리
export const INQUIRY_CATEGORIES = {
  GENERAL: '일반문의',
  TECHNICAL: '기술지원',
  SERVICE: '서비스문의',
  OTHER: '기타',
} as const

// 우선순위
export const PRIORITY_LEVELS = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
} as const

// 관리자 사용자 ID
export const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || 'f0887d78-02cc-4e94-a9a5-76baf8bac9f4'

// 테마 색상
export const COLORS = {
  PRIMARY: '#EB5A36',
  PRIMARY_LIGHT: '#FF5A36',
  SECONDARY: '#FADCD2',
  BACKGROUND: '#F3F3F3',
  BACKGROUND_LIGHT: '#F6F6F6',
  TEXT_DARK: '#000000',
  TEXT_GRAY: '#666666',
  WHITE: '#FFFFFF',
  BORDER: '#E5E5E5',
} as const

// 화구 타입 및 가격
export const BURNER_TYPES = [
  { id: 1, name: '(일반화구) 1열 1구', price: 20000 },
  { id: 2, name: '(일반화구) 1열 2구', price: 30000 },
  { id: 3, name: '(일반화구) 1열 3구', price: 40000 },
  { id: 4, name: '(시그마버너) 1열 1구', price: 40000 },
  { id: 5, name: '(시그마버너) 1열 2구', price: 60000 },
  { id: 6, name: '(시그마버너) 1열 3구', price: 80000 },
] as const
