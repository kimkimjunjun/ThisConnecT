import { useState, useEffect, useCallback } from 'react'
import { getChannels } from '../api/channel-api'
import type { Channel } from '../api/channel-api'

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getChannels().then(setChannels).catch(() => {})
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { channels, refresh }
}
