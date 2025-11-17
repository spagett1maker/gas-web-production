import ServiceTemplate from '@/components/ServiceTemplate'

export default function PipePage() {
  return (
    <ServiceTemplate
      serviceName="배관 철거"
      serviceKey="pipe"
      serviceTitle="배관 철거"
      showTextInput
      textInputPlaceholder="철거가 필요한 배관의 위치와 규모를 설명해주세요"
    />
  )
}
