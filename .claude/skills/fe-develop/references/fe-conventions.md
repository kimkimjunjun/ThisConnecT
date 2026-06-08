# FE 상세 컨벤션

## features/ 작성 예시

```typescript
// features/notification/api/notification-api.ts
export const getNotifications = () =>
  fetchAPI<Notification[]>(END_POINT.NOTIFICATION.LIST)

export const markAsRead = (id: number) =>
  fetchAPI<void>(END_POINT.NOTIFICATION.READ(id), { method: 'PATCH' })

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

## fetchAPI 위치
`src/apps/client/src/shared/api/fetch-api.ts`

## END_POINT 위치
`src/apps/client/src/shared/config/end-point.ts`

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
