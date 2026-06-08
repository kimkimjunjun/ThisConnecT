---
name: review
description: "구현된 FE/BE 코드를 프로젝트 컨벤션·보안·성능 기준으로 검토. '코드 리뷰해줘', '검토해줘', '확인해줘' 요청 또는 orchestrate 파이프라인의 Phase 3에서 트리거. code-reviewer 에이전트가 사용."
---

# Review — 코드 검토

## 검토 절차

1. `git diff HEAD` 또는 `git diff origin/develop...HEAD`로 변경 내용 파악
2. 블로킹 이슈 체크 (아래 목록)
3. 권고 사항 수집
4. `PASS` 또는 `BLOCK(이유)` 결정

## 블로킹 체크리스트 (하나라도 해당 시 BLOCK)

### 공통
- [ ] 민감 정보 하드코딩 (토큰, 패스워드, API 키)
- [ ] `console.log` / `System.out.println` 남음
- [ ] 컴파일·타입 오류 가능성

### FE
- [ ] 컴포넌트에서 `fetchAPI`·`fetch`·`END_POINT` 직접 호출
- [ ] features/ 구조 미준수 (api/hooks/index.ts 분리 안 됨)
- [ ] effect 내 조건 없는 무한 setState
- [ ] XSS 가능성 (`dangerouslySetInnerHTML` 무분별 사용)
- [ ] API 응답 타입 ↔ 프론트 훅 타입 불일치

### BE
- [ ] JWT 인증 없는 보호 엔드포인트 노출
- [ ] `@Transactional` 누락으로 데이터 정합성 위험
- [ ] N+1 쿼리 (반복 루프 안에서 리포지토리 호출)
- [ ] SQL Injection (네이티브 쿼리에 문자열 직접 concat)
- [ ] 패키지 구조 위반 (domain이 global 의존)

## 권고 사항 (PASS하되 언급)

- 코드 중복 (DRY 원칙)
- 불필요한 렌더링 유발 (useMemo/useCallback 미사용)
- 미사용 import
- 변수명 가독성
- 에러 핸들링 누락

## 출력 형식

```
결과: PASS | BLOCK

[BLOCK인 경우]
## 블로킹 이슈
1. [파일:줄번호] 이슈 설명 → 수정 방법

[공통]
## 권고 사항
- 권고 내용 (선택 수정)
```
