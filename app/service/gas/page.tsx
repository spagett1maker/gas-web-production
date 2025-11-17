import ServiceTemplate from '@/components/ServiceTemplate'

export default function GasPage() {
  return (
    <ServiceTemplate
      serviceName="가스누출 검사"
      serviceKey="gas"
      serviceTitle="가스누출 검사"
      showTextInput
      textInputPlaceholder="가스 누출이 의심되는 위치나 증상을 설명해주세요"
    />
  )
}
