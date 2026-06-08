---
description: 이슈 번호와 타입을 받아 브랜치 명명 규칙에 맞게 생성하고 전환
allowed-tools: Bash
---

다음 절차로 새 브랜치를 생성하고 전환합니다.

## 입력
$ARGUMENTS (예: `71 chore claude-settings` 또는 `72 feat fe login-ui`)

## 절차

1. **develop 최신화**
   ```bash
   git checkout develop && git pull origin develop
   ```

2. **브랜치명 결정** — 아래 규칙을 따릅니다:
   ```
   feat/#<번호>/fe/<설명>    → 프론트엔드 기능
   feat/#<번호>/be/<설명>    → 백엔드 기능
   fix/#<번호>/fe/<설명>     → 프론트엔드 버그
   fix/#<번호>/be/<설명>     → 백엔드 버그
   refactor/#<번호>/<설명>   → FE/BE 구분 없는 리팩터링
   chore/#<번호>/<설명>      → 빌드/설정/기타
   docs/#<번호>/<설명>       → 문서
   ```
   - `<설명>`은 kebab-case
   - 인자가 없으면 이슈 번호·타입·설명을 사용자에게 질문

3. **브랜치 생성 및 전환**
   ```bash
   git checkout -b "<브랜치명>"
   ```

4. 생성된 브랜치명과 **코드 수정 범위**(fe→client만, be→server만, 없으면 양쪽)를 사용자에게 알립니다.
