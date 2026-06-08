---
description: develop 대상 PR을 PR 템플릿과 타이틀 형식에 맞게 생성
allowed-tools: Bash
---

현재 브랜치의 커밋 이력을 바탕으로 PR을 생성합니다.

## 입력
$ARGUMENTS (선택 — 이슈 번호 또는 추가 설명)

## PR 타이틀 형식
```
[TYPE/SCOPE] #<이슈번호> <제목>
```

| TYPE | SCOPE | 조건 |
|---|---|---|
| `FEAT` | `FE` | feat + /fe/ 포함 |
| `FEAT` | `BE` | feat + /be/ 포함 |
| `FIX` | `FE` | fix + /fe/ 포함 |
| `FIX` | `BE` | fix + /be/ 포함 |
| `REFACTOR` | `FE`/`BE` | refactor |
| `CHORE` | `FE`/`BE` | chore |
| `DOCS` | — | docs |

브랜치명에 `/fe/` → SCOPE=FE, `/be/` → SCOPE=BE, 둘 다 없으면 SCOPE 생략

## PR 본문 형식 (필수)
```
## 💡작업 내용
<!-- 무엇을, 왜 했는지 한 줄 요약 + 상세 변경점 -->

## 📸스크린샷(선택)

## 🔗관련 이슈
Closes #<이슈번호>
```

## 절차

1. `git log origin/develop..HEAD` 로 커밋 목록 확인
2. `git diff origin/develop...HEAD --stat` 로 변경 파일 파악
3. 브랜치명에서 TYPE/SCOPE/이슈번호 추출
4. 커밋 내용을 상세하게 분석해 작업 내용 작성
5. 브랜치 푸시 (필요 시):
   ```bash
   git push origin <브랜치명>
   ```
6. PR 생성:
   ```bash
   gh pr create --base develop --head "<브랜치>" --title "..." --body "$(cat <<'EOF'
   ## 💡작업 내용
   ...
   ## 🔗관련 이슈
   Closes #<번호>
   EOF
   )"
   ```

## 제약
- base는 항상 `develop` (feat/fix/refactor/chore 브랜치)
- `## 💡작업 내용`, `## 🔗관련 이슈` 섹션 필수 포함
