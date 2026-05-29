import { useState, useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import { getMemberInfo } from '../api/member-api'
import type { MemberInfo } from '../api/member-api'

export type { MemberInfo }

export const useMemberInfo = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  const updateLevel = useAuthStore((s) => s.updateLevel)
  const [data, setData] = useState<MemberInfo | null>(null)

  useEffect(() => {
    if (!accessToken) return
    getMemberInfo()
      .then((json) => {
        setData(json)
        if (json.level !== null) updateLevel(json.level)
      })
      .catch(() => {})
  }, [accessToken, updateLevel])

  return data
}
