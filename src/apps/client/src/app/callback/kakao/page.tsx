'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { postSocialCallback } from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/features/auth/store/auth-store'

const KakaoCallbackHandler = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      router.replace('/?error=auth_cancelled')
      return
    }

    postSocialCallback('kakao', code)
      .then((data) => {
        setAuth(data)
        const pending = sessionStorage.getItem('auth_pending_route')
        sessionStorage.removeItem('auth_pending_route')
        router.replace(pending ?? '/')
      })
      .catch(() => {
        router.replace('/?error=auth_failed')
      })
  }, [searchParams, router, setAuth])

  return null
}

export default function KakaoCallbackPage() {
  return (
    <Suspense>
      <KakaoCallbackHandler />
    </Suspense>
  )
}
