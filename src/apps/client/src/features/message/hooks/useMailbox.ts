import { useState, useEffect, useCallback } from 'react'
import { getInbox, getOutbox, markAsRead, type MessageItem } from '../api/message-api'

export const useMailbox = (tab: 'inbox' | 'outbox') => {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [prevTab, setPrevTab] = useState(tab)

  // tab 변경 시 렌더 단계에서 즉시 초기화 — effect 내 동기 setState 제거
  if (prevTab !== tab) {
    setPrevTab(tab)
    setLoading(true)
    setError(false)
  }

  useEffect(() => {
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
