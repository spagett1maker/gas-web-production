import ServiceTemplate from '@/components/ServiceTemplate'

export default function ValvePage() {
  return (
    <ServiceTemplate
      serviceName="밸브 교체"
      serviceKey="valve"
      serviceTitle="밸브 교체 (공기 조절기)"
      showTextInput
      textInputPlaceholder="밸브 교체가 필요한 위치와 상태를 자세히 설명해주세요"
    />
  )
}
