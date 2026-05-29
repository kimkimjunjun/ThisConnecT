import { fetchAPI } from '@/shared/api'
import { END_POINT } from '@/shared/api/endpoint'

export type MemberInfo = {
  username: string | null
  provider: string
  nickname: string
  role: string
  level: number | null
  xp: number | null
  requiredXp: number | null
}

export const getMemberInfo = () =>
  fetchAPI<MemberInfo>(END_POINT.MEMBER.MY_INFO)

export const patchNickname = (nickname: string) =>
  fetchAPI<MemberInfo>(END_POINT.MEMBER.UPDATE_NICKNAME, {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  })
