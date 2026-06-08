---
description: 현재 브랜치를 origin에 푸시
allowed-tools: Bash
---

현재 브랜치를 origin에 즉시 푸시합니다.

## 절차

1. 현재 브랜치명 확인:
   ```bash
   git branch --show-current
   ```
2. 푸시 실행:
   ```bash
   git push origin <현재 브랜치명>
   ```

## 금지
- `--force` 푸시 절대 금지 (필요 시 `--force-with-lease` 사용)
- `main`, `prod` 브랜치에 직접 푸시 금지
