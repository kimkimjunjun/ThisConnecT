import { privateApi } from '@/shared/api'
import { END_POINT } from '@/shared/api/endpoint'

export type ReportResponse = {
  id: number
  reportedId: number
  reason: string
  createdAt: string
}

export type ReportListItem = {
  id: number
  reporterId: number
  reporterNickname: string
  reportedId: number
  reportedNickname: string
  reason: string
  createdAt: string
}

export const createReport = (reportedId: number, reason: string) =>
  privateApi
    .post<ReportResponse>(END_POINT.REPORT.CREATE, { reportedId, reason })
    .then((r) => r.data)

export const getReports = () =>
  privateApi.get<ReportListItem[]>(END_POINT.REPORT.LIST).then((r) => r.data)

export const getReportsByReported = (reportedId: number) =>
  privateApi
    .get<ReportListItem[]>(END_POINT.REPORT.BY_REPORTED(reportedId))
    .then((r) => r.data)
