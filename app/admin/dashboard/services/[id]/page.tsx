import AdminDashboardServiceDetailClient from './client'

export const dynamicParams = false

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <AdminDashboardServiceDetailClient id={resolvedParams.id} />
}
