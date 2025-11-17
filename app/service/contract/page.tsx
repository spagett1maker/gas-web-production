import ServiceTemplate from '@/components/ServiceTemplate'

const CONTRACT_ITEMS = [
  { id: 1, name: '1개월 정기계약', price: 50000, icon: '📝' },
  { id: 2, name: '3개월 정기계약', price: 140000, icon: '📝' },
  { id: 3, name: '6개월 정기계약', price: 270000, icon: '📝' },
  { id: 4, name: '12개월 정기계약', price: 500000, icon: '📝' },
]

export default function ContractPage() {
  return (
    <ServiceTemplate
      serviceName="정기계약 이용권"
      serviceKey="contract"
      serviceTitle="정기계약 이용권"
      items={CONTRACT_ITEMS}
      showItemSelection
    />
  )
}
