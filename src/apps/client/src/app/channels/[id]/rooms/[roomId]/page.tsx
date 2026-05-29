import { DashboardLayout } from '@/widgets/dashboard-layout'
import { RoomWrapper } from '@/views/room'

type Props = { params: Promise<{ id: string; roomId: string }> }

export default async function RoomPage({ params }: Props) {
  const { id, roomId } = await params

  return (
    <DashboardLayout>
      <RoomWrapper channelId={id} roomId={roomId} />
    </DashboardLayout>
  )
}
