import { fetchAPI } from '@/shared/api'
import { END_POINT } from '@/shared/api/endpoint'

export type ReportResponse = {
  id: number
  reportedId: number
  reason: string
  createdAt: string
}

export const createReport = (reportedId: number, reason: string) =>
  fetchAPI<ReportResponse>(END_POINT.REPORT.CREATE, {
    method: 'POST',
    body: JSON.stringify({ reportedId, reason }),
  })
