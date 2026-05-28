import { redirect } from 'next/navigation'
import { postSocialCallback } from '@/features/auth/api/auth-api'

type SearchParams = Promise<{ code?: string; error?: string }>

export default async function GoogleCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { code, error } = await searchParams

  if (error || !code) {
    redirect('/?error=auth_cancelled')
  }

  try {
    await postSocialCallback('google', code)
    redirect('/')
  } catch {
    redirect('/?error=auth_failed')
  }
}
