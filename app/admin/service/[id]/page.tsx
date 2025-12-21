import AdminServiceDetailClient from './client'

export const dynamicParams = false

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default async function AdminServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <AdminServiceDetailClient id={resolvedParams.id} />
}
