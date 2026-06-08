---
description: 백엔드 도메인 폴더 구조에 맞게 새 도메인 레이어 스캐폴딩
allowed-tools: Bash, Write, Read
---

`src/apps/server/src/main/java/com/thisconnect/server/domain/<domain>/` 구조에 맞게 새 도메인을 생성합니다.

## 입력
$ARGUMENTS (예: `notification` 또는 `alarm push`)

## 생성 구조
```
domain/<domain>/
├── controller/
│   └── <Domain>Controller.java
├── dto/
│   ├── request/
│   │   └── Create<Domain>Request.java
│   └── response/
│       └── <Domain>Response.java
├── entity/
│   └── <Domain>.java              # JPA 엔티티
├── repository/
│   └── <Domain>Repository.java    # JpaRepository 상속
└── service/
    └── <Domain>Service.java
```

## 각 파일 규칙

### Entity
- `@Entity`, `@Table`, `@Id`, `@GeneratedValue` 필수
- `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor` (Lombok)
- `Member`와 연관 시 `@ManyToOne(fetch = LAZY)` 사용

### Repository
- `JpaRepository<Entity, Long>` 상속
- 인터페이스만 정의 (구현체 불필요)

### DTO
- record 사용 (`public record XxxRequest(...)`)
- 유효성 검사 필요 시 `@NotBlank`, `@NotNull` 등 추가

### Service
- `@Service`, `@RequiredArgsConstructor`
- `@Transactional` 선언적 트랜잭션
- 예외는 `RuntimeException` 상속 클래스 사용

### Controller
- `@RestController`, `@RequestMapping`, `@RequiredArgsConstructor`
- 패키지: `com.thisconnect.server.domain.<domain>.controller`
- 모든 import 경로 `com.thisconnect.server.domain.<domain>.*` 사용

## 절차

1. 도메인명 결정 (인자 없으면 질문)
2. 연관 엔티티(`Member`, `Channel` 등) 파악
3. 각 파일 생성
4. 필요 시 `global/config/` 또는 `global/security/` 수정 불필요 여부 확인

## 참고 파일
- 기존 도메인 예: `src/apps/server/src/main/java/com/thisconnect/server/domain/member/`
- 글로벌 설정: `src/apps/server/src/main/java/com/thisconnect/server/global/`
