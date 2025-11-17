import ServiceTemplate from '@/components/ServiceTemplate'

const ALARM_ITEMS = [
  { id: 1, name: '일반형 가스 경보기', price: 35000, icon: '🚨' },
  { id: 2, name: '디지털 가스 경보기', price: 55000, icon: '🚨' },
  { id: 3, name: '무선 가스 경보기', price: 75000, icon: '🚨' },
]

export default function AlarmPage() {
  return (
    <ServiceTemplate
      serviceName="경보기 교체"
      serviceKey="alarm"
      serviceTitle="경보기 교체"
      items={ALARM_ITEMS}
      showItemSelection
    />
  )
}
