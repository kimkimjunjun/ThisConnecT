'use client'

import { useState } from 'react'
import { useMailbox, sendDirectMessage } from '@/features/message'
import { ReportModal } from '@/views/room'
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
  const [replyingId, setReplyingId] = useState<number | null>(null)
  const [replyTitle, setReplyTitle] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [replySending, setReplySending] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replySuccess, setReplySuccess] = useState(false)
  const [reportingNickname, setReportingNickname] = useState<string | null>(null)

  const { messages, loading, error, markRead } = useMailbox(tab)

  const handleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      setReplyingId(null)
      return
    }
    setExpandedId(id)
    setReplyingId(null)
    const msg = messages.find((m) => m.id === id)
    if (tab === 'inbox' && msg && !msg.isRead) {
      markRead(id)
    }
  }

  const handleReplyToggle = (msgId: number, originalTitle: string) => {
    if (replyingId === msgId) {
      setReplyingId(null)
      return
    }
    setReplyingId(msgId)
    setReplyTitle(`Re: ${originalTitle}`)
    setReplyContent('')
    setReplyError(null)
    setReplySuccess(false)
  }

  const handleReplySend = async (receiverNickname: string) => {
    if (!replyContent.trim()) return
    setReplySending(true)
    setReplyError(null)
    try {
      await sendDirectMessage(receiverNickname, replyContent.trim(), replyTitle.trim())
      setReplySuccess(true)
      setTimeout(() => {
        setReplyingId(null)
        setReplySuccess(false)
      }, 1200)
    } catch {
      setReplyError('답장 발송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setReplySending(false)
    }
  }

  const handleTabChange = (next: Tab) => {
    setTab(next)
    setExpandedId(null)
    setReplyingId(null)
  }

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
          onClick={() => handleTabChange('inbox')}
        >
          수신함
        </button>
        <button
          className={`${styles.tab} ${tab === 'outbox' ? styles.tabActive : ''}`}
          role="tab"
          aria-selected={tab === 'outbox'}
          onClick={() => handleTabChange('outbox')}
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
            const isReplying = replyingId === msg.id

            return (
              <li key={msg.id} className={styles.item}>
                <button
                  className={styles.itemHeader}
                  onClick={() => handleExpand(msg.id)}
                  aria-expanded={isExpanded}
                >
                  <div className={styles.itemMeta}>
                    {tab === 'inbox' && (
                      <span className={msg.isRead ? styles.badgeRead : styles.badgeUnread}>
                        {msg.isRead ? '읽음' : '안읽음'}
                      </span>
                    )}
                    <span className={styles.itemTitle}>{msg.title}</span>
                    <span className={styles.itemParty}>
                      {tab === 'inbox'
                        ? `보낸이: ${msg.senderNickname}`
                        : `받는이: ${msg.receiverNickname}`}
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

                    {tab === 'inbox' && (
                      <div className={styles.replySection}>
                        <div className={styles.actionBtns}>
                          <button
                            className={`${styles.replyToggleBtn} ${isReplying ? styles.replyToggleBtnActive : ''}`}
                            onClick={() => handleReplyToggle(msg.id, msg.title)}
                          >
                            답장하기
                          </button>
                          <button
                            className={styles.reportBtn}
                            onClick={() => setReportingNickname(msg.senderNickname)}
                          >
                            신고하기
                          </button>
                        </div>

                        {isReplying && (
                          <div className={styles.replyForm}>
                            {replySuccess ? (
                              <p className={styles.replySuccess}>답장이 발송되었습니다.</p>
                            ) : (
                              <>
                                <input
                                  className={styles.replyInput}
                                  type="text"
                                  placeholder="제목"
                                  value={replyTitle}
                                  onChange={(e) => setReplyTitle(e.target.value)}
                                  maxLength={100}
                                  disabled={replySending}
                                />
                                <textarea
                                  className={styles.replyTextarea}
                                  placeholder="내용을 입력하세요 (최대 500자)"
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  maxLength={500}
                                  rows={3}
                                  disabled={replySending}
                                />
                                <div className={styles.replyFooter}>
                                  {replyError && <p className={styles.replyError}>{replyError}</p>}
                                  <span className={styles.replyCharCount}>{replyContent.length} / 500</span>
                                  <button
                                    className={styles.replySendBtn}
                                    onClick={() => handleReplySend(msg.senderNickname)}
                                    disabled={replySending || !replyContent.trim()}
                                  >
                                    {replySending ? '전송 중...' : '보내기'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {reportingNickname && (
        <ReportModal
          targetNickname={reportingNickname}
          targetMemberId={undefined}
          onClose={() => setReportingNickname(null)}
        />
      )}
    </div>
  )
}
