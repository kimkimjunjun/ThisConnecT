import { notFound } from 'next/navigation'
import { DashboardLayout } from '@/widgets/dashboard-layout'
import { RoomBrowser } from '@/views/home/ui/RoomBrowser'
import { CATEGORIES, ROOMS_BY_CATEGORY } from '@/mock/channels'

type Props = { params: Promise<{ id: string }> }

export default async function ChannelPage({ params }: Props) {
  const { id } = await params
  const category = CATEGORIES.find((c) => c.id === id)

  if (!category) notFound()

  return (
    <DashboardLayout>
      <RoomBrowser
        categoryName={category.name}
        rooms={ROOMS_BY_CATEGORY[id] ?? []}
      />
    </DashboardLayout>
  )
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }))
}
