# FE 상세 컨벤션

## API 인스턴스

`src/apps/client/src/shared/api/base.ts`에서 export:

- `privateApi` — 인증 필요 API (자동 Authorization 헤더 주입 + 401 시 토큰 갱신)
- `publicApi` — 인증 불필요 API (소셜 콜백, 게스트 로그인, 토큰 갱신)

## features/ 작성 예시

```typescript
// features/notification/api/notification-api.ts
import { privateApi } from '@/shared/api/base'
import { END_POINT } from '@/shared/api/endpoint'

export const getNotifications = () =>
  privateApi.get<Notification[]>(END_POINT.NOTIFICATION.LIST).then(r => r.data)

export const markAsRead = (id: number) =>
  privateApi.patch(END_POINT.NOTIFICATION.READ(id)).then(r => r.data)

// features/notification/hooks/useNotifications.ts
export const useNotifications = () => {
  const [data, setData] = useState<Notification[] | null>(null)
  useEffect(() => {
    getNotifications().then(setData).catch(() => {})
  }, [])
  return data
}

// features/notification/index.ts
export { getNotifications, markAsRead } from './api/notification-api'
export { useNotifications } from './hooks/useNotifications'
export type { Notification } from './api/notification-api'
```

## 주요 파일 위치

| 항목 | 경로 |
|------|------|
| Axios 인스턴스 (`privateApi`, `publicApi`) | `src/apps/client/src/shared/api/base.ts` |
| 엔드포인트 상수 (`END_POINT`) | `src/apps/client/src/shared/api/endpoint.ts` |

## API 함수 작성 규칙

- 인증 필요 → `privateApi` 사용
- 인증 불필요 (로그인, 토큰 갱신 등) → `publicApi` 사용
- 응답 데이터만 반환: `.then(r => r.data)` 패턴
- 에러 처리는 훅 레이어에서 담당

## SCSS Modules 패턴
```scss
// Component.module.scss
.container { ... }
.title { ... }
```
```tsx
import styles from './Component.module.scss'
<div className={styles.container}>
```

## 공유 컴포넌트
`src/apps/client/src/shared/` 하위에 위치.
도메인 종속 컴포넌트는 `views/<domain>/ui/` 또는 `features/<domain>/` 하위.
