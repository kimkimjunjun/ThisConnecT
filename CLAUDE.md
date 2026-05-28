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

## Branch Rules
```
main          → 배포용 (직접 push 금지)
develop       → 개발 통합 브랜치
feat/#1/card  → 기능 개발
fix/#2/login  → 버그 수정
refactor/#3/my-page → 리팩터링
```

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
3. PR → `develop` (PR 템플릿 사용)
4. 배포: `develop` → `main`

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
