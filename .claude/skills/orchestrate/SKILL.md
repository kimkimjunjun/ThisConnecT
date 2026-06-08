---
name: orchestrate
description: "ThisConnecT 개발 파이프라인 오케스트레이터. feat/fix/refactor/chore 브랜치 작업, 기능 구현, 버그 수정, 리팩터링, 신규 API 개발, 컴포넌트 작성 등 모든 개발 작업 요청 시 반드시 이 스킬을 사용할 것. '구현해줘', '만들어줘', '수정해줘', '추가해줘', '고쳐줘' 등 코드 변경을 포함하는 요청에 항상 트리거."
---

# Orchestrate — 개발 파이프라인

## Phase 0: 컨텍스트 확인

작업 시작 전 현재 상태를 파악한다.

```bash
git branch --show-current        # 현재 브랜치
git status --short               # 변경 파일 현황
git log --oneline -3             # 최근 커밋 흐름
```

분기:
- `_workspace/` 존재 + 부분 수정 요청 → **부분 재실행** (해당 에이전트만 재호출)
- `_workspace/` 존재 + 새 요청 → 기존 `_workspace/` → `_workspace_prev/` 이동 후 **새 실행**
- `_workspace/` 미존재 → **초기 실행**

## Phase 1: 작업 분석

1. 요청에서 **작업 유형** 파악: `feat | fix | refactor | chore`
2. **범위 결정** — 브랜치명 또는 요청 내용 기준:
   - `/fe/` 포함 또는 UI·컴포넌트·훅 관련 → FE 에이전트 필요
   - `/be/` 포함 또는 API·엔티티·서비스 관련 → BE 에이전트 필요
   - 둘 다 언급 → FE + BE 병렬 실행
3. **접근법** 요약 (1~3줄): 무엇을, 어느 파일에, 어떻게 변경할지
4. 사용자에게 분석 결과 보고 후 진행

## Phase 2: 구현

범위에 따라 에이전트를 호출한다. FE·BE 모두 필요하면 `run_in_background: true`로 병렬 실행.

```
FE만:   fe-developer 단독 호출
BE만:   be-developer 단독 호출
FE+BE:  fe-developer (background) + be-developer (background) 동시 호출 → 둘 다 완료 대기
```

각 에이전트에 전달할 정보:
- 구현할 기능/수정 설명
- 관련 기존 파일 경로 (grep/glob으로 미리 파악)
- 브랜치별 수정 범위 제한 (CLAUDE.md 규칙)

산출물은 `_workspace/02_impl_fe.md`, `_workspace/02_impl_be.md`에 요약 저장.

## Phase 3: 코드 리뷰

구현 완료 후 code-reviewer를 호출한다.

```bash
git diff HEAD  # 변경 내용을 reviewer에게 전달
```

- **PASS**: Phase 4로 진행
- **BLOCK**: 블로킹 이슈를 해당 에이전트에게 재전달 → 수정 후 재리뷰 (최대 2회)

## Phase 4: Git 처리

git-manager를 호출한다. 사용자가 "커밋만", "PR까지" 중 선택하게 한다.

- 커밋만: `git add → commit`
- PR까지: `git add → commit → push → gh pr create`

## 에러 핸들링

| 상황 | 처리 |
|------|------|
| 에이전트 타임아웃 | 1회 재호출, 재실패 시 해당 Phase 스킵 후 보고 |
| 리뷰 BLOCK 2회 초과 | 사용자에게 수동 검토 요청 |
| Git 충돌 | git-manager에게 충돌 파일 목록 전달, 해결 후 재시도 |

## 테스트 시나리오

**정상 흐름 (FE+BE 신규 기능):**
1. Phase 0: `feat/#72/fe/notification` 브랜치 확인
2. Phase 1: FE(알림 컴포넌트) + BE(알림 API) 범위 확인
3. Phase 2: fe-developer, be-developer 병렬 실행
4. Phase 3: code-reviewer → PASS
5. Phase 4: git-manager → 커밋

**에러 흐름 (리뷰 BLOCK):**
1. Phase 3: reviewer가 features/ 구조 위반 발견 → BLOCK
2. fe-developer에 수정 요청 → 재구현
3. Phase 3 재실행 → PASS
