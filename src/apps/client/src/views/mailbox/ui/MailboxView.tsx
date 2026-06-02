'use client'

import { useState } from 'react'
import { useMailbox } from '@/features/message'
import styles from './MailboxView.module.scss'

type Tab = 'inbox' | 'outbox'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export const MailboxView = () => {
  const [tab, setTab] = useState<Tab>('inbox')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { messages, loading, error } = useMailbox(tab)

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>쪽지함</h1>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          className={`${styles.tab} ${tab === 'inbox' ? styles.tabActive : ''}`}
          role="tab"
          aria-selected={tab === 'inbox'}
          onClick={() => { setTab('inbox'); setExpandedId(null) }}
        >
          수신함
        </button>
        <button
          className={`${styles.tab} ${tab === 'outbox' ? styles.tabActive : ''}`}
          role="tab"
          aria-selected={tab === 'outbox'}
          onClick={() => { setTab('outbox'); setExpandedId(null) }}
        >
          발신함
        </button>
      </div>

      {loading && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>쪽지를 불러오지 못했습니다.</p>
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>
            {tab === 'inbox' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
          </p>
        </div>
      )}

      {!loading && !error && messages.length > 0 && (
        <ul className={styles.list}>
          {messages.map((msg) => {
            const isExpanded = expandedId === msg.id
            const isUnread = tab === 'inbox' && msg.readAt === null
            return (
              <li key={msg.id} className={styles.item}>
                <button
                  className={styles.itemHeader}
                  onClick={() => toggleExpand(msg.id)}
                  aria-expanded={isExpanded}
                >
                  <div className={styles.itemMeta}>
                    {isUnread && <span className={styles.unreadDot} aria-label="읽지 않음" />}
                    <span className={styles.itemTitle}>{msg.title}</span>
                    <span className={styles.itemParty}>
                      {tab === 'inbox' ? `보낸이: ${msg.senderNickname}` : `받는이: ${msg.receiverNickname}`}
                    </span>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemDate}>{formatDate(msg.sentAt)}</span>
                    <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>▾</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className={styles.itemBody}>
                    <p className={styles.itemContent}>{msg.content}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
