import { useState, useEffect } from 'react'
import { getInbox, getOutbox, type MessageItem } from '../api/message-api'

export const useMailbox = (tab: 'inbox' | 'outbox') => {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    const fetcher = tab === 'inbox' ? getInbox : getOutbox
    fetcher()
      .then(setMessages)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [tab])

  return { messages, loading, error }
}
