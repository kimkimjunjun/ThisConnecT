---
name: be-develop
description: "Spring Boot 3 + Java 17 + JPA 백엔드 구현 가이드. 신규 도메인 API, 엔티티 설계, STOMP WebSocket 핸들러, 인증/인가 코드 작성 시 참조. be-developer 에이전트가 사용."
---

# BE Develop — 구현 가이드

## 수정 범위
`src/apps/server/` 하위만. 브랜치에 `/be/` 포함 시 강제 적용.

## 패키지 구조 (MUST)

```
com.thisconnect.server
├── domain/
│   ├── auth/
│   │   ├── controller/  dto/(request/ response/)  service/
│   │   └── oauth/       # OAuthClient 인터페이스 + 소셜별 구현체
│   ├── channel/
│   │   ├── controller/  dto/(request/ response/)  service/
│   │   └── entity/  repository/
│   ├── chat/
│   │   ├── controller/  dto/(request/ response/)
│   │   └── service/     # ※ entity/repository 없음 — 인메모리 세션만 관리
│   ├── member/
│   │   ├── controller/  dto/(request/ response/)  service/
│   │   └── entity/  repository/
│   ├── message/
│   │   ├── controller/  dto/(request/ response/)  service/
│   │   └── entity/  repository/
│   └── report/
│       ├── controller/  dto/(request/ response/)  service/
│       └── entity/  repository/
└── global/
    ├── config/      (SecurityConfig, SwaggerConfig, WebConfig, WebSocketConfig)
    ├── controller/  (HealthController)
    └── security/    (JwtAuthFilter, JwtProvider, WebSocketAuthInterceptor)
```

→ 상세 패턴: `references/be-conventions.md`

## 코드 작성 규칙

### 엔티티
```java
@Entity @Table(name = "...")
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class Domain {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}
```

### DTO (record 필수)
```java
public record CreateDomainRequest(
    @NotBlank String title,
    @NotNull Long relatedId
) {}
```

### Repository
```java
public interface DomainRepository extends JpaRepository<Domain, Long> {
    List<Domain> findByMember(Member member);
}
```

### Service
```java
@Service @RequiredArgsConstructor
public class DomainService {
    private final DomainRepository domainRepository;

    @Transactional
    public DomainResponse create(CreateDomainRequest req) { ... }

    @Transactional(readOnly = true)
    public List<DomainResponse> findAll() { ... }
}
```

### Controller
```java
@Tag(name = "Domain", description = "도메인 설명")
@RestController
@RequestMapping("/api/domains")
@RequiredArgsConstructor
public class DomainController {
    private final DomainService domainService;

    @Operation(summary = "생성")
    @PostMapping
    public ResponseEntity<DomainResponse> create(
        @RequestBody @Valid CreateDomainRequest req) {
        return ResponseEntity.ok(domainService.create(req));
    }
}
```
→ 모든 엔드포인트에 `@Tag` + `@Operation` + `@ApiResponses` 추가 필수

## WebSocket (STOMP)
- `@Controller` (`@RestController` 아님)
- `@MessageMapping` + `SimpMessagingTemplate`
- 연결 해제: `@EventListener(SessionDisconnectEvent.class)`
- 구독 토픽 패턴: `/sub/rooms/{roomId}/chat`, `/sub/rooms/{roomId}/participants`, `/sub/rooms/{roomId}/voice`
- 참조: `ChatController.java`

## 인증/보안
- access token (1h): `Authorization: Bearer <token>` 헤더
- refresh token (7d): HttpOnly 쿠키 (`refresh_token`, path=`/api/auth`)
- JWT 검증: `JwtAuthFilter` 기존 필터 재사용
- 새 퍼블릭 엔드포인트: `SecurityConfig`의 `permitAll()` 목록에 추가
- GUEST role: DB 미저장, JWT claims에만 존재

## 환경변수 (application.yml)
| 키 | 기본값 | 설명 |
|----|--------|------|
| `app.cors.allowed-origins` | `http://localhost:3000` | CORS 허용 오리진 (쉼표 구분) |
| `app.cookie.secure` | `false` | 운영 환경에서 `true` |
| `jwt.secret` | (Base64 기본값) | HMAC-SHA 시크릿 |
| `DATABASE_URL` | `jdbc:mysql://localhost:3306/disconnectdb` | DB 연결 |

## 테스트 환경
`src/test/resources/application.yml` — H2 인메모리 DB (MySQL 호환 모드)
