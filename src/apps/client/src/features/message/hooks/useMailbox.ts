import { useState, useEffect, useCallback } from 'react'
import { getInbox, getOutbox, markAsRead, type MessageItem } from '../api/message-api'

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

  const markRead = useCallback((messageId: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
    )
    markAsRead(messageId).catch(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isRead: false } : m))
      )
    })
  }, [])

  return { messages, loading, error, markRead }
}
