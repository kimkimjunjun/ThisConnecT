import { redirect } from 'next/navigation'
import { postSocialCallback } from '@/features/auth/api/auth-api'

type SearchParams = Promise<{ code?: string; error?: string }>

export default async function KakaoCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { code, error } = await searchParams

  if (error || !code) {
    redirect('/?error=auth_cancelled')
  }

  try {
    await postSocialCallback('kakao', code)
  } catch (err) {
    console.error('[kakao callback error]', err)
    redirect('/?error=auth_failed')
  }
  redirect('/')
}
