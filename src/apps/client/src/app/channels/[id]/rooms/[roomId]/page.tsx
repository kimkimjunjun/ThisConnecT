import { notFound } from 'next/navigation'
import { DashboardLayout } from '@/widgets/dashboard-layout'
import { RoomView } from '@/views/room'
import { CATEGORIES, ROOMS_BY_CATEGORY } from '@/mock/channels'

type Props = { params: Promise<{ id: string; roomId: string }> }

export default async function RoomPage({ params }: Props) {
  const { id, roomId } = await params
  const category = CATEGORIES.find((c) => c.id === id)
  const room = ROOMS_BY_CATEGORY[id]?.find((r) => r.id === roomId)

  if (!category || !room) notFound()

  return (
    <DashboardLayout>
      <RoomView room={room} categoryId={id} />
    </DashboardLayout>
  )
}
