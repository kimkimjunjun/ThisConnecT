import { fetchAPI } from '@/shared/api'
import { END_POINT } from '@/shared/api/endpoint'

export const sendDirectMessage = (receiverNickname: string, content: string) =>
  fetchAPI<void>(END_POINT.MESSAGE.SEND, {
    method: 'POST',
    body: JSON.stringify({ receiverNickname, content }),
  })
