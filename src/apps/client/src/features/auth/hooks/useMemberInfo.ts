import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth-store'
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

export const useMemberInfo = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const updateLevel = useAuthStore((s) => s.updateLevel)
  const [data, setData] = useState<MemberInfo | null>(null)

  useEffect(() => {
    if (!accessToken) return
    fetchAPI<MemberInfo>(END_POINT.MEMBER.MY_INFO)
      .then((json) => {
        setData(json)
        if (json.level !== null) updateLevel(json.level)
      })
      .catch(() => {})
  }, [accessToken, updateLevel])

  return data
}
