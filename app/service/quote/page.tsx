import ServiceTemplate from '@/components/ServiceTemplate'

export default function QuotePage() {
  return (
    <ServiceTemplate
      serviceName="시공견적 문의"
      serviceKey="quote"
      serviceTitle="시공견적 문의"
      showTextInput
      textInputPlaceholder="시공이 필요한 내용을 자세히 작성해주세요 (예: 가스레인지 설치, 배관 공사 등)"
    />
  )
}
