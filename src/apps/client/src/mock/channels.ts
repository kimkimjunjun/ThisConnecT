export type Category = {
  id: string
  name: string
  unread: number
}

export type ChatRoom = {
  id: string
  title: string
  currentCount: number
  maxCount: number
}

export const CATEGORIES: Category[] = [
  { id: '1', name: '일반', unread: 0 },
  { id: '2', name: '게임', unread: 3 },
  { id: '3', name: '공지', unread: 0 },
  { id: '4', name: '랜덤', unread: 1 },
  { id: '5', name: '자유', unread: 0 },
]

export const ROOMS_BY_CATEGORY: Record<string, ChatRoom[]> = {
  '1': [
    { id: '1-1', title: '오늘의 일상', currentCount: 3, maxCount: 10 },
    { id: '1-2', title: '잡담 나눠요', currentCount: 7, maxCount: 10 },
    { id: '1-3', title: '하루 어땠어요?', currentCount: 2, maxCount: 8 },
    { id: '1-4', title: '새벽 감성방', currentCount: 6, maxCount: 6 },
    { id: '1-5', title: '오늘 뭐 먹었어요', currentCount: 4, maxCount: 10 },
    { id: '1-6', title: '날씨 이야기', currentCount: 1, maxCount: 5 },
    { id: '1-7', title: '주말 계획 공유', currentCount: 8, maxCount: 10 },
    { id: '1-8', title: '취미 공유방', currentCount: 3, maxCount: 8 },
  ],
  '2': [
    { id: '2-1', title: '리그오브레전드', currentCount: 10, maxCount: 10 },
    { id: '2-2', title: '발로란트 같이 해요', currentCount: 3, maxCount: 5 },
    { id: '2-3', title: '배틀그라운드', currentCount: 6, maxCount: 8 },
    { id: '2-4', title: '롤 다이아 파티', currentCount: 2, maxCount: 5 },
    { id: '2-5', title: '스팀 멀티게임', currentCount: 4, maxCount: 6 },
    { id: '2-6', title: '마인크래프트', currentCount: 7, maxCount: 8 },
    { id: '2-7', title: '오버워치2', currentCount: 5, maxCount: 6 },
    { id: '2-8', title: '피파온라인', currentCount: 1, maxCount: 4 },
  ],
  '3': [
    { id: '3-1', title: '2024 이벤트 안내', currentCount: 15, maxCount: 50 },
    { id: '3-2', title: '서버 점검 공지', currentCount: 8, maxCount: 50 },
    { id: '3-3', title: '이용약관 변경 안내', currentCount: 3, maxCount: 50 },
    { id: '3-4', title: '신기능 업데이트', currentCount: 21, maxCount: 50 },
  ],
  '4': [
    { id: '4-1', title: '아무 말 대잔치', currentCount: 9, maxCount: 10 },
    { id: '4-2', title: '랜덤 주제 토론', currentCount: 4, maxCount: 8 },
    { id: '4-3', title: '즉흥 노래방', currentCount: 6, maxCount: 6 },
    { id: '4-4', title: '수수께끼 방', currentCount: 2, maxCount: 5 },
    { id: '4-5', title: '갑자기 요리 방송', currentCount: 3, maxCount: 8 },
    { id: '4-6', title: '퀴즈 한판', currentCount: 5, maxCount: 8 },
  ],
  '5': [
    { id: '5-1', title: '뭐든 괜찮아요', currentCount: 5, maxCount: 10 },
    { id: '5-2', title: '취업 고민 방', currentCount: 7, maxCount: 10 },
    { id: '5-3', title: '연애 상담소', currentCount: 4, maxCount: 8 },
    { id: '5-4', title: '진로 고민 방', currentCount: 2, maxCount: 6 },
    { id: '5-5', title: '친구 사귀어요', currentCount: 6, maxCount: 10 },
    { id: '5-6', title: '일상 공유방', currentCount: 3, maxCount: 5 },
  ],
}
