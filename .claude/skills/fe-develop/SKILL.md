---
name: fe-develop
description: "Next.js 16 + React 19 + TypeScript + SCSS Modules 프론트엔드 구현 가이드. features/ 도메인 레이어 작성, 컴포넌트 개발, 커스텀 훅 구현, STOMP/WebRTC 관련 코드 작성 시 참조. fe-developer 에이전트가 사용."
---

# FE Develop — 구현 가이드

## 수정 범위
`src/apps/client/` 하위만. 브랜치에 `/fe/` 포함 시 강제 적용.

## features/ 구조 (MUST)

```
features/<domain>/
├── api/<domain>-api.ts    # privateApi/publicApi 호출 순수 함수만
├── hooks/use<Domain>.ts   # 상태·이펙트 포함 훅
└── index.ts               # barrel export
```

컴포넌트에서 `privateApi`, `publicApi`, `fetch`, `END_POINT`, `env` **직접 사용 금지**.
→ 상세 패턴: `references/fe-conventions.md`

## 코드 작성 규칙

### 네이밍
- 컴포넌트: PascalCase (`UserCard.tsx`)
- 훅: camelCase use* (`useVoiceChat.ts`)
- 파일/폴더: kebab-case (`chat-api.ts`)
- 함수: 화살표 함수 (`const getUser = () => {}`)

### 컴포넌트
- default export
- SCSS Modules 사용 (`.module.scss`)
- 주석 없이 네이밍으로 의미 전달

### 훅
- named export
- React Compiler 호환 필수:
  - effect 내 동기 `setState` 금지
  - 정리(cleanup) 반드시 return 함수로

### Next.js App Router
- `"use client"` 지시어: 상태·이펙트 필요한 컴포넌트에만
- `app/` 하위 page·layout은 Server Component 기본
- 신규 라우트: `node_modules/next/dist/docs/` 가이드 확인

## 주요 패턴

### Zustand 스토어
```typescript
// features/<domain>/store/<domain>-store.ts
export const use<Domain>Store = create<State>()(
  persist((set) => ({ ... }), { name: '<domain>' })
)
```

### STOMP/WebSocket
- `@stomp/stompjs` 클라이언트 사용
- `useRoom` 훅 패턴 참조: `src/apps/client/src/features/chat/hooks/useRoom.ts`

### WebRTC
- `useVoiceChat` 훅 패턴 참조
- AudioContext는 `suspended` 상태 체크 + `resume()` 호출 필수

## 금지 패턴
- `privateApi`/`publicApi` 컴포넌트 직접 호출
- `fetch` 직접 사용 (axios 인스턴스 경유 필수)
- `any` 타입 사용
- effect 내 조건 없는 `setState` 루프
