---
description: 변경사항을 커밋 컨벤션에 맞게 스테이징하고 커밋
allowed-tools: Bash
---

현재 변경사항을 분석해 커밋 컨벤션에 맞게 커밋합니다.

## 입력
$ARGUMENTS (선택 — 커밋 메시지 힌트 또는 생략)

## 절차

1. `git status` + `git diff` 로 변경 내용 확인
2. `git log --oneline -5` 로 이 레포 커밋 스타일 참고
3. **현재 브랜치명**에서 커밋 타입 추출:
   - `feat/*` → `feat`
   - `fix/*` → `fix`
   - `refactor/*` → `refactor`
   - `chore/*` → `chore`
   - `docs/*` → `docs`
4. 변경 내용을 요약해 커밋 메시지 초안 작성:
   ```
   <type>(<scope>): <한 줄 요약>
   
   <필요 시 상세 설명>
   
   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   ```
5. 관련 파일만 `git add` (민감 파일·바이너리 제외)
6. `git commit -m "..."`

## 금지
- `--no-verify` 사용 절대 금지
- `.env`, credentials 포함 금지
