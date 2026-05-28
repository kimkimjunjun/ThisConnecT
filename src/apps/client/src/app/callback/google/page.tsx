'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { postSocialCallback } from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/features/auth/store/auth-store'

const GoogleCallbackHandler = () => {
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

    postSocialCallback('google', code)
      .then((data) => {
        setAuth(data)
        router.replace('/')
      })
      .catch(() => {
        router.replace('/?error=auth_failed')
      })
  }, [searchParams, router, setAuth])

  return null
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackHandler />
    </Suspense>
  )
}
