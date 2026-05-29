import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth-store'
import { env } from '@/shared/config'

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
    fetch(`${env.API_BASE_URL}/api/members/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: MemberInfo | null) => {
        if (!json) return
        setData(json)
        if (json.level !== null) updateLevel(json.level)
      })
      .catch(() => {})
  }, [accessToken, updateLevel])

  return data
}
