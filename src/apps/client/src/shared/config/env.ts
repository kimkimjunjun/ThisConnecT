export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',

  KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? '',
  KAKAO_REDIRECT_URI:
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ??
    'http://localhost:3000/callback/kakao',

  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  GOOGLE_REDIRECT_URI:
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
    'http://localhost:3000/callback/google',
} as const
