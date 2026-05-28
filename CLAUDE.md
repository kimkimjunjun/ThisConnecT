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
prod          → 운영 배포용 (직접 push 금지, staging에서만 병합)
staging       → 배포 전 검증 브랜치 (develop에서만 병합)
develop       → 개발 통합 브랜치 (서브 브랜치 PR 대상)
feat/#1/card  → 기능 개발
fix/#2/login  → 버그 수정
refactor/#3/my-page → 리팩터링
```

병합 흐름:
```
feat/* | fix/* | refactor/*
  → PR → develop
         → PR → staging
                → PR → prod
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
3. PR → `develop` (PR 템플릿 사용, 서브 브랜치는 반드시 `develop`으로만 PR)
4. 검증: `develop` → `staging` PR
5. 배포: `staging` → `prod` PR

## PR 생성 규칙 (Claude 자동화)
PR 생성 시 **반드시** `.github/pull_request_template.md` 템플릿을 사용해야 함:
```
## 💡작업 내용
<!-- 무엇을, 왜 했는지 한 줄 요약 + 상세 변경점 -->

## 📸스크린샷(선택)

## 🔗관련 이슈
Closes #<이슈번호>

## 💬원하는 리뷰 방식(선택)
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
