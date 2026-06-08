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
├── domain/<domain>/
│   ├── controller/<Domain>Controller.java
│   ├── dto/
│   │   ├── request/  (record 사용)
│   │   └── response/ (record 사용)
│   ├── entity/<Domain>.java
│   ├── repository/<Domain>Repository.java
│   └── service/<Domain>Service.java
└── global/
    ├── config/   (Security, Swagger, Web, WebSocket)
    └── security/ (JWT, Filter, Interceptor)
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
    @JoinColumn(name = "member_id")
    private Member member;
}
```

### DTO (record)
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
@RestController
@RequestMapping("/api/domains")
@RequiredArgsConstructor
public class DomainController {
    private final DomainService domainService;
    
    @PostMapping
    public ResponseEntity<DomainResponse> create(
        @RequestBody @Valid CreateDomainRequest req) {
        return ResponseEntity.ok(domainService.create(req));
    }
}
```

## WebSocket (STOMP)
- 핸들러: `@MessageMapping` + `SimpMessagingTemplate`
- 시그널링 패턴: `ChatController` 참조
- CORS: `application.yml`의 `app.cors.allowed-origins` 환경변수 사용

## 보안
- JWT 검증: `JwtAuthFilter` 기존 필터 재사용
- 새 엔드포인트 인증 필요 시 `SecurityConfig`에 경로 추가

## 테스트 환경
`src/test/resources/application.yml` — H2 인메모리 DB (MySQL 호환 모드)
