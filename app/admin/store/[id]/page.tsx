import AdminStoreDetailClient from './client'

export const dynamicParams = false

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default async function AdminStoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <AdminStoreDetailClient id={resolvedParams.id} />
}
