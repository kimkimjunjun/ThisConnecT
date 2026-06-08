# ThisConnecT Project

## Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript + SCSS Modules (`src/apps/client`)
- **Backend**: Spring Boot + Gradle (`src/apps/server`)

---

## Coding Conventions

### Naming Rules
| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `UserCard.tsx` |
| 훅 | camelCase (`use*`) | `useAuth.ts` |
| 파일/폴더 | kebab-case | `auth-service.ts` |
| 함수 | 화살표 함수 | `const getUser = () => {}` |

### Code Style
- 화살표 함수만 사용 (클래스 메서드 제외)
- 컴포넌트는 default export, 훅은 named export

### FE API 연동 규칙 (IMPORTANT)
컴포넌트 내부에서 `fetchAPI`, `fetch`, `END_POINT`, `env` 직접 사용 금지.
반드시 `features/<domain>/` 구조로 분리:
```
features/<domain>/
├── api/<domain>-api.ts   # fetchAPI 순수 함수만
├── hooks/use<Domain>.ts  # 상태·사이드이펙트 포함 훅
└── index.ts              # barrel export
```
→ 신규 도메인 생성 시 `/fe-feature` 스킬 사용

### BE 폴더 구조 (IMPORTANT)
```
domain/<domain>/
├── controller/  dto/  entity/  repository/  service/
global/
├── config/  security/  controller/
```
→ 신규 도메인 생성 시 `/be-domain` 스킬 사용

---

## 브랜치별 코드 수정 범위 (IMPORTANT)

현재 브랜치명을 확인하여 수정 가능한 코드 범위를 제한한다:

- `/fe/` 포함 → `src/apps/client/` 만 수정
- `/be/` 포함 → `src/apps/server/` 만 수정
- 둘 다 없음 → 제한 없음

---

## Commit Convention
```
feat | fix | docs | style | refactor | test | chore | build
```

---

## Available Skills

| 스킬 | 용도 |
|---|---|
| `/new-branch` | 이슈 번호·타입으로 브랜치 생성 및 전환 |
| `/commit` | 변경사항 분석 후 컨벤션에 맞게 커밋 |
| `/push` | 현재 브랜치 origin 푸시 |
| `/pr` | develop 대상 PR 생성 (템플릿·타이틀 자동 적용) |
| `/fe-feature` | FE features/ 도메인 레이어 스캐폴딩 |
| `/be-domain` | BE domain/ 도메인 레이어 스캐폴딩 |
