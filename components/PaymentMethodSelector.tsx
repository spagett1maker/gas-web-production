'use client'

interface PaymentMethodSelectorProps {
  onPaymentMethodChange: (method: string) => void
  selectedMethod?: string
}

const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: '현금 결제',
    icon: '💵',
    description: '서비스 완료 후 현장에서 현금으로 결제합니다.',
  },
  {
    id: 'card',
    name: '카드 결제',
    icon: '💳',
    description: '서비스 완료 후 현장에서 카드로 결제합니다.',
  },
  {
    id: 'transfer',
    name: '계좌 이체',
    icon: '🏦',
    description: '서비스 완료 후 계좌 이체로 결제합니다.',
  },
  {
    id: 'later',
    name: '추후 협의',
    icon: '📞',
    description: '결제 방법은 담당자와 협의 후 결정합니다.',
  },
]

export default function PaymentMethodSelector({
  onPaymentMethodChange,
  selectedMethod = '',
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-[15px] font-semibold text-gray-800 mb-3">
        결제 방법
      </label>

      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id
        return (
          <button
            key={method.id}
            onClick={() => onPaymentMethodChange(method.id)}
            className={`w-full flex items-start rounded-xl px-4 py-4 border-2 transition-all ${
              isSelected
                ? 'border-[#EB5A36] bg-[#FFF8F6]'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mr-3 flex-shrink-0">{method.icon}</div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between mb-1">
                <p
                  className={`text-[15px] font-bold ${
                    isSelected ? 'text-[#EB5A36]' : 'text-gray-800'
                  }`}
                >
                  {method.name}
                </p>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#EB5A36]' : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-[#EB5A36]" />
                  )}
                </div>
              </div>
              <p className="text-[13px] text-gray-600">{method.description}</p>
            </div>
          </button>
        )
      })}

      <div className="bg-[#F6F7FB] rounded-xl p-4 mt-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0"
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
          <p className="text-[13px] text-gray-700">
            결제는 서비스 완료 후에 진행되며, 세금계산서 발행이 가능합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
