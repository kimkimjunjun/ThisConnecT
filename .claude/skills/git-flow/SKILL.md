---
name: git-flow
description: "ThisConnecT Git 워크플로우. 브랜치 생성, 커밋, 푸시, PR 생성을 프로젝트 규칙에 맞게 처리. '커밋해줘', '푸시해줘', 'PR 올려줘', '브랜치 만들어줘', '이슈 N번 브랜치' 요청 시 반드시 이 스킬을 사용할 것. orchestrate 파이프라인 Phase 4에서도 트리거. git-manager 에이전트가 사용."
---

# Git Flow — Git 워크플로우

## 브랜치 생성

```bash
git checkout develop && git pull origin develop
git checkout -b "<브랜치명>"
```

브랜치 명명 규칙:
```
feat/#N/fe/<설명>   | feat/#N/be/<설명>
fix/#N/fe/<설명>    | fix/#N/be/<설명>
refactor/#N/<설명>
chore/#N/<설명>
docs/#N/<설명>
```
`<설명>`은 kebab-case.

## 커밋

```bash
git add <파일목록>          # 필요한 파일만 (git add -A 지양)
git commit -m "$(cat <<'EOF'
<type>(<scope>): <요약>

<상세 설명 (선택)>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

타입: `feat | fix | refactor | chore | docs | style | test | build`

## 푸시

```bash
git push origin <현재 브랜치명>
```

## PR 생성

```bash
gh pr create \
  --base develop \
  --head "<현재 브랜치>" \
  --title "[TYPE/SCOPE] #N <제목>" \
  --body "$(cat <<'EOF'
## 💡작업 내용
<무엇을, 왜 했는지 + 상세 변경점>

## 🔗관련 이슈
Closes #N
EOF
)"
```

PR 타이틀 SCOPE 결정:
- 브랜치에 `/fe/` → `FE`
- 브랜치에 `/be/` → `BE`
- 둘 다 없음 → SCOPE 생략 (예: `[REFACTOR] #N <제목>`)

## 금지 규칙
- `--no-verify` 절대 금지
- `--force` 절대 금지 (`--force-with-lease`는 허용)
- `main`·`prod` 브랜치 직접 푸시 금지
- 서브 브랜치 PR base는 항상 `develop`

## 브랜치별 코드 수정 범위
- `/fe/` 포함 → `src/apps/client/`만
- `/be/` 포함 → `src/apps/server/`만
- 둘 다 없음 → 제한 없음
