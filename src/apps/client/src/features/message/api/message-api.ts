import { fetchAPI } from '@/shared/api'
import { END_POINT } from '@/shared/api/endpoint'

export type MessageItem = {
  id: number
  senderNickname: string
  receiverNickname: string
  title: string
  content: string
  sentAt: string
  readAt: string | null
}

export const sendDirectMessage = (receiverNickname: string, content: string) =>
  fetchAPI<void>(END_POINT.MESSAGE.SEND, {
    method: 'POST',
    body: JSON.stringify({ receiverNickname, content }),
  })

export const getInbox = () =>
  fetchAPI<MessageItem[]>(END_POINT.MESSAGE.INBOX)

export const getOutbox = () =>
  fetchAPI<MessageItem[]>(END_POINT.MESSAGE.OUTBOX)
