import { privateApi } from '@/shared/api'
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

export type MemberIdResponse = {
  id: number
}

export const getMemberInfo = () =>
  privateApi.get<MemberInfo>(END_POINT.MEMBER.MY_INFO).then((r) => r.data)

export const patchNickname = (nickname: string) =>
  privateApi
    .patch<MemberInfo>(END_POINT.MEMBER.UPDATE_NICKNAME, { nickname })
    .then((r) => r.data)

export const getMemberIdByNickname = (nickname: string) =>
  privateApi
    .get<MemberIdResponse>(END_POINT.MEMBER.BY_NICKNAME(nickname))
    .then((r) => r.data)
