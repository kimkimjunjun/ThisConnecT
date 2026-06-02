'use client'

import { useReports } from '@/features/report'
import styles from './ReportsView.module.scss'

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const ReportsView = () => {
  const { reports, loading, error } = useReports()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>신고 내역</h1>
        <span className={styles.count}>{loading ? '-' : `${reports.length}건`}</span>
      </div>

      {loading && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>신고 내역을 불러오지 못했습니다.</p>
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>신고 내역이 없습니다.</p>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <ul className={styles.list}>
          {reports.map((report) => (
            <li key={report.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <div className={styles.parties}>
                  <span className={styles.partyLabel}>신고자</span>
                  <span className={styles.partyName}>{report.reporterNickname}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.partyLabel}>피신고자</span>
                  <span className={styles.partyName}>{report.reportedNickname}</span>
                </div>
                <span className={styles.date}>{formatDate(report.createdAt)}</span>
              </div>
              <p className={styles.reason}>{report.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
