import { DashboardLayout } from '@/widgets/dashboard-layout'
import { ChannelView } from '@/views/channel'

type Props = { params: Promise<{ id: string }> }

export default async function ChannelPage({ params }: Props) {
  const { id } = await params

  return (
    <DashboardLayout>
      <ChannelView channelId={id} />
    </DashboardLayout>
  )
}
