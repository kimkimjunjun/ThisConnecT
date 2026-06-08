import { fetchAPI } from '@/shared/api'
import { END_POINT } from '@/shared/api/endpoint'

export type MessageItem = {
  id: number
  senderNickname: string
  receiverNickname: string
  title: string
  content: string
  sentAt: string
  isRead: boolean
}

export const sendDirectMessage = (receiverNickname: string, content: string, title?: string) =>
  fetchAPI<void>(END_POINT.MESSAGE.SEND, {
    method: 'POST',
    body: JSON.stringify({ receiverNickname, content, ...(title ? { title } : {}) }),
  })

export const getInbox = () =>
  fetchAPI<MessageItem[]>(END_POINT.MESSAGE.INBOX)

export const getOutbox = () =>
  fetchAPI<MessageItem[]>(END_POINT.MESSAGE.OUTBOX)

export const markAsRead = (messageId: number) =>
  fetchAPI<void>(END_POINT.MESSAGE.MARK_READ(messageId), { method: 'PATCH' })

export const deleteFromInbox = (messageId: number) =>
  fetchAPI<void>(END_POINT.MESSAGE.INBOX_DELETE(messageId), { method: 'DELETE' })

export const deleteFromOutbox = (messageId: number) =>
  fetchAPI<void>(END_POINT.MESSAGE.OUTBOX_DELETE(messageId), { method: 'DELETE' })
