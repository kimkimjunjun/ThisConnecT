import { env } from '@/shared/config'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const fetchAPI = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}
