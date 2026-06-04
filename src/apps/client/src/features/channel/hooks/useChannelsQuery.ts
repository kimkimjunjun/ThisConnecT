import { createQuery } from '@/shared/api'
import { getChannels } from '../api/channel-api'
import { channelsQueryKey } from '../query-keys'

export const useChannelsQuery = createQuery({
  queryKey: channelsQueryKey,
  queryFn: getChannels,
  options: { staleTime: 60 * 1000 },
})
