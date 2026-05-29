# Disconnect Project

## Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript + SCSS Modules (`src/apps/client`)
- **Backend**: Spring Boot + Gradle (`src/apps/server`)

## Coding Conventions

### Naming Rules
| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `UserCard.tsx`, `LoginForm.tsx` |
| 훅 | camelCase (`use*`) | `useAuth.ts`, `useFetchData.ts` |
| 파일/폴더 | kebab-case | `user-card.tsx`, `auth-service.ts` |
| 함수 | 화살표 함수 | `const getUser = () => {}` |

### Code Style
- 화살표 함수만 사용 (`const fn = () => {}`, 클래스 메서드 제외)
- 컴포넌트는 default export
- 훅은 named export

### API 연동 규칙 (IMPORTANT)

모든 API 호출은 컴포넌트 내부에 직접 작성하지 않고 반드시 `features/` 하위 폴더에 분리한다.

**폴더 구조:**
```
features/<domain>/
├── api/
│   └── <domain>-api.ts     # fetchAPI 호출 함수만 정의 (순수 함수)
├── hooks/
│   └── use<Domain>.ts      # API를 감싸는 React 훅 (상태, 사이드이펙트 포함)
└── index.ts                # 외부 공개 인터페이스 (barrel export)
```

**작성 규칙:**
- `api/*.ts`: `fetchAPI`를 호출하는 순수 함수만 작성. React 의존성 없음
- `hooks/*.ts`: `api/` 함수를 사용하는 훅만 작성. 상태(`useState`), 사이드이펙트(`useEffect`) 포함 가능
- 컴포넌트에서는 `features/<domain>` barrel export를 통해서만 import
- 컴포넌트 내부에서 `fetchAPI`, `fetch`, `END_POINT`, `env` 직접 사용 금지

**예시:**
```ts
// features/member/api/member-api.ts
export const getMemberInfo = () => fetchAPI<MemberInfo>(END_POINT.MEMBER.MY_INFO)
export const patchNickname = (nickname: string) =>
  fetchAPI<MemberInfo>(END_POINT.MEMBER.UPDATE_NICKNAME, { method: 'PATCH', body: JSON.stringify({ nickname }) })

// features/member/hooks/useMemberInfo.ts
export const useMemberInfo = () => {
  const [data, setData] = useState<MemberInfo | null>(null)
  useEffect(() => { getMemberInfo().then(setData).catch(() => {}) }, [])
  return data
}

// features/member/index.ts
export { getMemberInfo, patchNickname } from './api/member-api'
export { useMemberInfo } from './hooks/useMemberInfo'
export type { MemberInfo } from './api/member-api'

// 컴포넌트에서 사용
import { useMemberInfo, patchNickname } from '@/features/member'
```

## Branch Rules
```
prod                    → 운영 배포용 (직접 push 금지, staging에서만 병합)
staging                 → 배포 전 검증 브랜치 (develop에서만 병합)
develop                 → 개발 통합 브랜치 (서브 브랜치 PR 대상)
feat/#1/fe/card         → 프론트엔드 기능 개발
feat/#2/be/auth-api     → 백엔드 기능 개발
fix/#3/fe/login         → 프론트엔드 버그 수정
fix/#4/be/token         → 백엔드 버그 수정
refactor/#5/my-page     → FE/BE 구분 없는 리팩터링
```

병합 흐름:
```
feat/* | fix/* | refactor/*
  → PR → develop
         → PR → staging
                → PR → prod
```

## 브랜치별 코드 수정 범위 (IMPORTANT)

현재 브랜치명을 확인하여 수정 가능한 코드 범위를 제한한다:

- 브랜치명에 `/be/` 포함 → `src/apps/server/` 하위 파일만 수정
- 브랜치명에 `/fe/` 포함 → `src/apps/client/` 하위 파일만 수정
- `/be/` 또는 `/fe/` 없음 → 제한 없음 (양쪽 모두 수정 가능)

예시:
- `feat/#10/be/mypage-api` → 서버 코드만 수정, 클라이언트 코드 수정 금지
- `feat/#11/fe/mypage-ui` → 클라이언트 코드만 수정, 서버 코드 수정 금지

## Commit Convention
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서
style: 포맷팅 (기능 변경 없음)
refactor: 리팩터링
test: 테스트
chore: 빌드/설정
build: 빌드 시스템
```

## Development Flow
1. Issue 생성 → `develop`에서 브랜치 생성
2. 구현 → `git commit` (commitlint 자동 검증, prepare-commit-msg 훅으로 메시지 자동 생성)
3. PR → `develop` (PR 템플릿 사용, 서브 브랜치는 반드시 `develop`으로만 PR)
4. 검증: `develop` → `staging` PR
5. 배포: `staging` → `prod` PR

## PR 생성 규칙 (Claude 자동화)

### PR 제목 형식
```
[TYPE] #<이슈번호> <제목>
```
| TYPE | 사용 시점 |
|---|---|
| `[FEAT]` | 새로운 기능 |
| `[FIX]` | 버그 수정 |
| `[REFACTOR]` | 리팩터링 |
| `[CHORE]` | 빌드/설정/기타 |
| `[DOCS]` | 문서 |

예시:
- `[FEAT] #8 대시보드 UI 전체 구현`
- `[FIX] #12 로그인 모달 중복 노출 수정`
- `[REFACTOR] #15 인증 스토어 구조 개선`

### PR 본문
PR 생성 시 **반드시** `.github/pull_request_template.md` 템플릿을 사용해야 함:
```
## 💡작업 내용
<!-- 무엇을, 왜 했는지 한 줄 요약 + 상세 변경점 -->

## 📸스크린샷(선택)

## 🔗관련 이슈
Closes #<이슈번호>
```
- `## 💡작업 내용`, `## 🔗관련 이슈` 섹션은 필수
- 서브 브랜치(feat/fix/refactor) PR base는 반드시 `develop`
- 템플릿 없이 `gh pr create` 실행 시 훅에서 자동 차단됨

## Push Workflow (Claude 자동화)
"해당 브랜치에 푸시해줘" 또는 "푸시해줘" 요청 시 Claude는 확인 없이 즉시 실행:
```bash
git push origin <현재 브랜치명>
```
`git push *` 권한이 `.claude/settings.json` allow 목록에 등록되어 있음.

## Commit Message Auto-format
`prepare-commit-msg` 훅이 브랜치명 기반으로 커밋 메시지 접두사 자동 생성:
- 브랜치 `feat/#2/login` → 커밋 메시지 `feat(login): `
- 브랜치 `fix/#3/bug-name` → 커밋 메시지 `fix(bug-name): `

## Project Structure
```
disconnect/
├── src/
│   ├── apps/
│   │   ├── client/          # Next.js 16
│   │   │   ├── src/
│   │   │   │   ├── app/     # App Router
│   │   │   │   ├── components/  # PascalCase
│   │   │   │   └── hooks/   # camelCase (use*)
│   │   └── server/          # Spring Boot
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── .husky/                  # Git hooks
├── .claude/                 # Claude Code 설정
├── commitlint.config.js
└── package.json             # 루트 (tooling only)
```

## Setup
```bash
npm install          # husky + commitlint + lint-staged 설치
npm run prepare      # husky 초기화 (자동)
```
