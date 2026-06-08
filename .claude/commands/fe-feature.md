---
description: features/ 폴더 구조에 맞게 새 프론트엔드 도메인 API 레이어 스캐폴딩
allowed-tools: Bash, Write, Read
---

`src/apps/client/src/features/<domain>/` 구조에 맞게 새 도메인 파일을 생성합니다.

## 입력
$ARGUMENTS (예: `notification` 또는 `chat send-message`)

## 생성 구조
```
features/<domain>/
├── api/
│   └── <domain>-api.ts       # fetchAPI 호출 순수 함수만
├── hooks/
│   └── use<Domain>.ts         # API를 감싸는 React 훅
└── index.ts                   # barrel export
```

## 각 파일 규칙

### `api/<domain>-api.ts`
- `fetchAPI` + `END_POINT` 사용
- React 의존성(`useState`, `useEffect` 등) 금지
- 순수 함수만 작성

### `hooks/use<Domain>.ts`
- `api/` 함수만 호출 (직접 `fetchAPI` 호출 금지)
- `useState`, `useEffect` 사용 가능
- named export

### `index.ts`
- api 함수, 훅, 타입 모두 re-export
- 컴포넌트는 이 파일을 통해서만 import

## 절차

1. 도메인명 결정 (인자 없으면 질문)
2. 관련 기존 `END_POINT` 및 `fetchAPI` 사용 패턴 확인
3. 세 파일 생성 (타입, 함수 시그니처는 실제 API 스펙에 맞게)
4. 사용 예시 안내

## 참고 파일
- `src/apps/client/src/shared/api/` — fetchAPI, END_POINT 위치
- 기존 features 예: `src/apps/client/src/features/member/`
