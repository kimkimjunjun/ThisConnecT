# ThisConnecT

> 실시간 채팅 기반 익명 소통 플랫폼  
> Real-time anonymous community platform built with Next.js & Spring Boot

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [주요 기능](#주요-기능)
- [브랜치 전략 & 개발 워크플로우](#브랜치-전략--개발-워크플로우)
- [CI/CD 파이프라인](#cicd-파이프라인)
- [커밋 컨벤션](#커밋-컨벤션)
- [Claude AI 활용 방식](#claude-ai-활용-방식)
- [로컬 개발 환경 설정](#로컬-개발-환경-설정)

---

## 프로젝트 소개

ThisConnecT은 Discord에서 영감을 받은 실시간 채팅 + 쪽지(DM) + 신고 관리 플랫폼입니다.  
소셜 로그인(카카오·구글) 또는 닉네임만으로 비회원 참여가 가능하며, 관리자 역할을 통해 채널과 신고 내역을 관리할 수 있습니다.

```
채널(Channel) → 채팅방(Room) → 실시간 WebSocket 채팅
                              → 음성 채팅 (WebRTC)
회원(Member)  → 쪽지(Message) 수·발신
              → 신고(Report) 제출 / 관리자 신고 목록
```

---

## 기술 스택

### Frontend

| 분류 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| UI 라이브러리 | React 19 |
| 언어 | TypeScript 5 |
| 스타일링 | SCSS Modules |
| 서버 상태 관리 | TanStack React Query v5 |
| 클라이언트 상태 관리 | Zustand v5 (persist) |
| 실시간 통신 | STOMP over WebSocket (`@stomp/stompjs`) |
| 음성 통신 | WebRTC (`getUserMedia`) |
| 배포 | Vercel |

### Backend

| 분류 | 기술 |
|---|---|
| 프레임워크 | Spring Boot 3.3 |
| 언어 | Java 17 |
| ORM | Spring Data JPA / Hibernate |
| DB | MySQL |
| 인증/인가 | Spring Security + JWT (`jjwt 0.12`) |
| 소셜 로그인 | OAuth 2.0 (카카오, 구글) |
| API 문서 | SpringDoc OpenAPI (Swagger UI) |
| 빌드 도구 | Gradle |
| 배포 | AWS EC2 (systemd) |

### DevOps / Tooling

| 분류 | 기술 |
|---|---|
| 패키지 매니저 | pnpm 9 (모노레포) |
| CI/CD | GitHub Actions |
| Git Hook | Husky + commitlint + lint-staged |
| 코드 포맷 | ESLint (Next.js 규칙셋) |
| AI 어시스턴트 | Claude Code (Anthropic) |

---

## 아키텍처

### 모노레포 구조

```
disconnect/
├── src/
│   ├── apps/
│   │   ├── client/          # Next.js 16
│   │   └── server/          # Spring Boot
├── .github/
│   ├── workflows/           # CI/CD (be-ci, be-cd, fe-ci, fe-cd)
│   └── ISSUE_TEMPLATE/      # 이슈 템플릿
├── .husky/                  # Git hooks
├── .claude/                 # Claude Code 설정
├── commitlint.config.js
└── package.json             # 루트 (tooling only)
```

### Frontend — Feature-Sliced Design (FSD)

Next.js App Router 위에 FSD에서 영감을 받은 계층형 폴더 구조를 적용합니다.

```
src/apps/client/src/
├── app/                     # App Router — 라우팅 진입점 (page, layout)
│   ├── (home)/
│   ├── channels/[id]/
│   ├── mailbox/
│   ├── mypage/
│   ├── reports/
│   └── callback/            # OAuth 콜백 (kakao, google)
│
├── features/                # 도메인 단위 기능 모듈
│   ├── auth/                # 소셜·비회원 로그인, 토큰 갱신, auth 스토어
│   ├── channel/             # 채널/채팅방 목록, CRUD
│   ├── chat/                # STOMP WebSocket, 음성 채팅
│   ├── member/              # 닉네임 수정, 내 정보 조회
│   ├── message/             # 쪽지 수·발신, 읽음 처리
│   ├── report/              # 신고 제출, 목록 조회
│   └── audio/               # WebRTC 음성 스트림 상태
│
├── views/                   # 페이지 단위 UI 조합
├── widgets/                 # 재사용 복합 컴포넌트 (header, sidebar, layout)
├── entities/                # 도메인 타입 정의
└── shared/                  # 공통 유틸 (api, config, styles, ui, lib)
```

**features 내부 규칙 (`api → hooks → index` 3-layer)**

```
features/<domain>/
├── api/
│   └── <domain>-api.ts     # fetchAPI 호출 순수 함수 (React 의존성 없음)
├── hooks/
│   └── use<Domain>.ts      # 상태·사이드이펙트 포함 React 훅
└── index.ts                # barrel export — 외부 공개 인터페이스만 노출
```

컴포넌트에서는 `features/<domain>` 배럴을 통해서만 import하며, `fetchAPI`, `fetch`, `END_POINT`, `env`를 컴포넌트 내부에서 직접 사용하는 것을 금지합니다.

### Backend — Layered Architecture

```
com.disconnect.server/
├── controller/              # REST + WebSocket 컨트롤러
├── service/                 # 비즈니스 로직
├── repository/              # Spring Data JPA 인터페이스
├── domain/                  # JPA 엔티티
│   ├── channel/
│   ├── chatroom/
│   ├── member/              # Role: ADMIN · USER · GUEST
│   ├── message/
│   └── report/
├── dto/                     # request / response DTO
├── security/                # JWT 필터, SecurityConfig
├── oauth/                   # 카카오·구글 OAuth 처리
└── config/                  # CORS, WebSocket, JPA 설정
```

### 인증 플로우

```
1. 소셜 로그인  → OAuth provider → /api/auth/{provider}/callback
                                → JWT accessToken 발급 (헤더) + refreshToken (HttpOnly 쿠키)
2. 비회원 로그인 → /api/auth/guest + 닉네임 → GUEST 토큰 발급
3. 토큰 갱신   → accessToken 만료 시 자동으로 /api/auth/refresh 호출
                → STOMP 연결 전 사전 갱신으로 Anonymous 닉네임 버그 방지
4. 클라이언트  → Zustand persist → localStorage에 토큰 영속화
```

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 소셜 로그인 | 카카오 / 구글 OAuth 2.0 |
| 비회원 로그인 | 닉네임만으로 GUEST 역할 참여 |
| 채널 관리 | 채널 생성·삭제 (USER/ADMIN), 채팅방 목록 |
| 실시간 채팅 | STOMP WebSocket, 메시지 이력 무한 스크롤 |
| 음성 채팅 | WebRTC getUserMedia 기반 인원 수 표시 |
| 쪽지(DM) | 수신함·발신함, 읽음 처리, 답장 |
| 신고 | 쪽지 신고, 관리자 신고 내역 조회 |
| 반응형 UI | 모바일 사이드바 자동 접힘, 쪽지함 레이아웃 최적화 |
| 스켈레톤 UI | 채팅방 목록 데이터 로딩 중 스켈레톤 카드 표시 |
| SSR prefetch | TanStack Query + Next.js 서버 컴포넌트 prefetch |

---

## 브랜치 전략 & 개발 워크플로우

### 브랜치 계층

```
prod      ─── 운영 배포 (직접 push 금지, develop에서만 병합)
develop   ─── 개발 통합 브랜치 (서브 브랜치 PR 대상)
│
├── feat/#<이슈번호>/fe/<설명>   # 프론트엔드 기능 개발
├── feat/#<이슈번호>/be/<설명>   # 백엔드 기능 개발
├── fix/#<이슈번호>/fe/<설명>    # 프론트엔드 버그 수정
├── fix/#<이슈번호>/be/<설명>    # 백엔드 버그 수정
└── refactor/#<이슈번호>/<설명>  # FE/BE 구분 없는 리팩터링
```

병합 흐름:
```
feat/* | fix/* | refactor/*
  └─ PR ─→ develop
              └─ PR ─→ prod
```

### 브랜치별 코드 수정 범위

| 브랜치 패턴 | 수정 허용 범위 |
|---|---|
| `/fe/` 포함 | `src/apps/client/` 하위만 |
| `/be/` 포함 | `src/apps/server/` 하위만 |
| 해당 없음 | 양쪽 모두 가능 |

### 개발 사이클

```
1. GitHub에서 이슈 생성
2. develop 기반으로 브랜치 생성 (브랜치명에 이슈번호 포함)
3. 구현
4. git commit → commitlint 자동 검증 + prepare-commit-msg 훅으로 접두사 자동 삽입
5. git push origin <브랜치>
6. PR 생성 (base: develop, PR 템플릿 + 이슈번호 필수)
7. CI 통과 확인 (빌드·타입체크)
8. develop 병합 → prod PR 생성 후 병합
9. prod 병합 시 CD 자동 트리거 → 자동 배포
```

---

## CI/CD 파이프라인

### GitHub Actions 워크플로우 구성

```
.github/workflows/
├── fe-ci.yml     # FE PR 빌드 검증 (develop · prod 대상 PR)
├── fe-cd.yml     # FE 배포 (prod 머지 시 → Vercel)
├── be-ci.yml     # BE PR 빌드·테스트 검증
└── be-cd.yml     # BE 배포 (prod 머지 시 → AWS EC2)
```

### FE CI (`fe-ci.yml`)

```
트리거: PR → develop | prod (src/apps/client/** 변경 시)
실행:   pnpm install → next build (타입 체크 포함)
```

### FE CD (`fe-cd.yml`)

```
트리거: push → prod (src/apps/client/** 변경 시)
실행:   Vercel CLI → vercel pull --environment=production
                  → vercel build --prod
                  → vercel deploy --prebuilt --prod
필요 시크릿: VERCEL_TOKEN · VERCEL_ORG_ID · VERCEL_PROJECT_ID
```

### BE CI (`be-ci.yml`)

```
트리거: PR → develop | prod (src/apps/server/** 변경 시)
실행:   JDK 17 (Corretto) → ./gradlew clean build -x test → ./gradlew test
```

### BE CD (`be-cd.yml`)

```
트리거: push → prod (src/apps/server/** 변경 시)
실행:   JDK 17 → ./gradlew clean bootJar -x test
        → SCP: JAR → EC2 /home/ec2-user/
        → SSH: mv app.jar → sudo systemctl restart thisconnect
필요 시크릿: EC2_HOST · EC2_SSH_KEY
```

---

## 커밋 컨벤션

commitlint로 자동 검증됩니다. `prepare-commit-msg` 훅이 브랜치명 기반으로 접두사를 자동 삽입합니다.

| 타입 | 사용 시점 |
|---|---|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 포맷팅 (기능 변경 없음) |
| `refactor` | 리팩터링 |
| `test` | 테스트 추가·수정 |
| `chore` | 빌드·설정·기타 |
| `build` | 빌드 시스템 변경 |

예시: 브랜치 `feat/#10/fe/mailbox-ui` → 커밋 `feat(mailbox-ui): 쪽지함 UI 구현`

### PR 제목 형식

```
[TYPE/SCOPE] #<이슈번호> <제목>
```

예시:
- `[FEAT/FE] #8 대시보드 UI 전체 구현`
- `[FEAT/BE] #9 채널 API 구현`
- `[FIX/FE] #52 만료 토큰 STOMP Anonymous 닉네임 버그 수정`

---

## Claude AI 활용 방식

이 프로젝트는 **Claude Code (Anthropic)**를 개발 전반에 걸쳐 AI 페어 프로그래밍 파트너로 활용합니다.  
단순한 코드 생성 도구를 넘어, 아키텍처 설계부터 배포 자동화까지 개발 사이클 전체에 통합되어 있습니다.

### 1. 아키텍처 설계 & 코드 구조화

- **FSD 기반 폴더 구조 설계**: `features/api/hooks/index` 3-layer 패턴을 Claude와 함께 정의하고, 컴포넌트에서 직접 fetch를 사용하는 것을 금지하는 규칙을 CLAUDE.md에 문서화
- **Server Component / Client Component 경계 설계**: Next.js 16 App Router의 서버·클라이언트 컴포넌트 경계를 인식하고, `server-only` 배럴 노출 오류 해결 방법 설계
- **TanStack Query + SSR prefetch 구조**: 서버 컴포넌트에서 `prefetchQuery` / `prefetchInfiniteQuery`를 호출하고 클라이언트에서 하이드레이션하는 패턴 도입

### 2. 실시간 기능 구현

- **STOMP WebSocket 연결 구조**: `@stomp/stompjs` 기반 STOMP 클라이언트 래퍼 설계, 연결·구독·메시지 송수신 훅(`useRoom`) 구현
- **토큰 갱신 버그 수정**: 만료된 accessToken으로 STOMP 연결 시 서버에서 Anonymous 닉네임으로 처리되는 버그를 발견하고, `beforeConnect` 훅에서 토큰을 동적으로 읽고 연결 전 사전 갱신(`tryRefresh`)을 수행하는 방식으로 해결
- **WebRTC 음성 채팅**: `getUserMedia` 기반 음성 스트림 권한 요청 및 참여 인원 표시 로직 구현

### 3. 인증 시스템

- **OAuth 2.0 소셜 로그인 플로우**: 카카오·구글 OAuth 콜백 처리, JWT 발급·저장·갱신 전체 흐름을 프론트엔드(Next.js)와 백엔드(Spring Security + JWT) 양쪽에서 설계
- **비회원(GUEST) 닉네임 로그인**: 소셜 계정 없이도 참여 가능한 게스트 인증 구현
- **Zustand persist 스토어**: accessToken, nickname, role을 localStorage에 영속화하고 서버 렌더링 hydration mismatch를 `useSyncExternalStore`로 해결

### 4. UI/UX 구현

- **반응형 사이드바**: `useSyncExternalStore` + localStorage 기반 사이드바 접힘 상태 동기화, 모바일에서 자동 접힘 고정 로직
- **스켈레톤 UI**: 채팅방 목록 데이터 로딩 중 스켈레톤 카드 20개 표시로 자연스러운 로딩 처리
- **쪽지함(Mailbox) UI**: 수신함·발신함 탭, 아코디언 펼치기, 읽음/미읽음 배지, 답장 폼, 신고 모달 구현
- **모달 드래그 버그 수정**: 모달 내 텍스트 드래그 후 backdrop에서 마우스를 떼면 모달이 닫히는 버그를 `mousedown` 타겟 추적으로 수정

### 5. CI/CD 자동화 구축

- **GitHub Actions 워크플로우 설계 및 작성**: FE(Vercel)와 BE(AWS EC2) 각각의 CI/CD 분리, PR 트리거 CI와 prod 머지 트리거 CD를 명확히 분리
- **EC2 JAR 배포 자동화**: `appleboy/scp-action` + `appleboy/ssh-action`을 통한 JAR 전송 → systemd 서비스 재시작 스크립트 작성
- **Vercel CLI 배포**: `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt` 단계별 배포 파이프라인 구성

### 6. 이슈·PR 관리 자동화

- **이슈 번호 기반 브랜치 생성 및 전환**: Claude에게 이슈 번호를 지정하면 브랜치 네이밍 컨벤션에 맞는 브랜치를 자동 생성·전환
- **PR 자동 생성**: 작업 완료 후 커밋 내역을 바탕으로 작업 내용·스크린샷 섹션·관련 이슈가 포함된 PR을 PR 템플릿에 맞춰 자동 작성
- **CLAUDE.md 기반 컨텍스트 공유**: 브랜치 전략, 코드 수정 범위 제한, API 연동 규칙 등 프로젝트 규칙을 CLAUDE.md에 명문화하여 Claude가 일관된 방식으로 작업

### CLAUDE.md — AI 작업 지침서

`.claude/settings.json`과 `CLAUDE.md`를 통해 Claude의 작업 범위와 자동화 규칙을 정의합니다:

- 브랜치명에 `/fe/` 포함 시 `src/apps/client/` 하위만 수정
- 브랜치명에 `/be/` 포함 시 `src/apps/server/` 하위만 수정
- 모든 API 호출은 반드시 `features/` 하위로 분리 (컴포넌트 내 직접 사용 금지)
- "푸시해줘" 요청 시 확인 없이 즉시 `git push origin <현재 브랜치>` 실행
- `prepare-commit-msg` 훅으로 브랜치명 기반 커밋 메시지 접두사 자동 생성

---

## 로컬 개발 환경 설정

### 사전 요구사항

- Node.js 20+
- pnpm 9+
- Java 17 (Amazon Corretto 권장)
- MySQL 8+

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/kimkimjunjun/ThisConnecT.git
cd ThisConnecT

# 루트 의존성 설치 (husky + commitlint)
npm install

# 프론트엔드 실행
pnpm web

# 백엔드 실행 (별도 터미널)
pnpm server
```

### 환경 변수

**Backend** (`src/apps/server/src/main/resources/application.yml`)

| 변수 | 설명 |
|---|---|
| `DATABASE_URL` | MySQL 연결 URL |
| `DATABASE_USERNAME` | DB 사용자 이름 |
| `DATABASE_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | JWT 서명 키 (256비트 이상) |
| `KAKAO_CLIENT_ID` | 카카오 OAuth 앱 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 OAuth 시크릿 |
| `KAKAO_REDIRECT_URI` | 카카오 콜백 URI |
| `GOOGLE_CLIENT_ID` | 구글 OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | 구글 OAuth 시크릿 |
| `GOOGLE_REDIRECT_URI` | 구글 콜백 URI |

**Frontend** — 환경 변수는 Vercel 프로젝트 설정에서 관리합니다.

### GitHub Actions 시크릿 설정

| 시크릿 | 용도 |
|---|---|
| `VERCEL_TOKEN` | Vercel 배포 인증 토큰 |
| `VERCEL_ORG_ID` | Vercel 조직 ID |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID |
| `EC2_HOST` | AWS EC2 퍼블릭 IP 또는 도메인 |
| `EC2_SSH_KEY` | EC2 접속용 PEM 키 (개인키 전체) |
