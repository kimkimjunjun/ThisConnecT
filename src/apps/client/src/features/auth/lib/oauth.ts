import { env } from '@/shared/config'

const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize'
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export const redirectToKakao = () => {
  const params = new URLSearchParams({
    client_id: env.KAKAO_CLIENT_ID,
    redirect_uri: env.KAKAO_REDIRECT_URI,
    response_type: 'code',
  })
  window.location.href = `${KAKAO_AUTH_URL}?${params.toString()}`
}

export const redirectToGoogle = () => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  })
  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`
}
