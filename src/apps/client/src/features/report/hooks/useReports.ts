import { useState, useEffect } from 'react'
import { getReports, type ReportListItem } from '../api/report-api'

export const useReports = () => {
  const [reports, setReports] = useState<ReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return { reports, loading, error }
}
