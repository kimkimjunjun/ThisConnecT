import { privateApi } from '@/shared/api'
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

export const sendDirectMessage = (
  receiverNickname: string,
  content: string,
  title?: string,
) =>
  privateApi
    .post<void>(END_POINT.MESSAGE.SEND, {
      receiverNickname,
      content,
      ...(title ? { title } : {}),
    })
    .then((r) => r.data)

export const getInbox = () =>
  privateApi.get<MessageItem[]>(END_POINT.MESSAGE.INBOX).then((r) => r.data)

export const getOutbox = () =>
  privateApi.get<MessageItem[]>(END_POINT.MESSAGE.OUTBOX).then((r) => r.data)

export const markAsRead = (messageId: number) =>
  privateApi
    .patch<void>(END_POINT.MESSAGE.MARK_READ(messageId))
    .then((r) => r.data)

export const deleteFromInbox = (messageId: number) =>
  privateApi
    .delete<void>(END_POINT.MESSAGE.INBOX_DELETE(messageId))
    .then((r) => r.data)

export const deleteFromOutbox = (messageId: number) =>
  privateApi
    .delete<void>(END_POINT.MESSAGE.OUTBOX_DELETE(messageId))
    .then((r) => r.data)
