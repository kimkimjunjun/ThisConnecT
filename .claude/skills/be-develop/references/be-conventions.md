# BE 상세 컨벤션

## 응답 패턴

```java
// 성공
ResponseEntity.ok(data)
// 생성
ResponseEntity.status(HttpStatus.CREATED).body(data)
// 본문 없음
ResponseEntity.noContent().build()
// 클라이언트 오류
throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "메시지");
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Domain not found: " + id);
```

## Swagger 어노테이션 (신규 엔드포인트 필수)

```java
@Tag(name = "Domain", description = "도메인 API 설명")
@RestController
public class DomainController {

    @Operation(summary = "짧은 요약", description = "상세 설명")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping
    public ResponseEntity<DomainResponse> create(...) { ... }
}
```

## refresh token 쿠키 패턴 (AuthController 참조)

```java
// 발급
ResponseCookie cookie = ResponseCookie.from("refresh_token", value)
    .httpOnly(true)
    .secure(cookieSecure)   // app.cookie.secure 환경변수
    .path("/api/auth")
    .maxAge(7 * 24 * 60 * 60)
    .sameSite("Lax")
    .build();
response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

// 무효화 (로그아웃)
ResponseCookie.from("refresh_token", "").httpOnly(true).path("/api/auth").maxAge(0).build();
```

## CORS 설정
`WebConfig.java`의 `CorsConfigurationSource` 빈이 `app.cors.allowed-origins` 환경변수를 읽음.
쉼표로 여러 오리진 구분 가능.

## OAuth 클라이언트 구조 (`auth/oauth/`)

```java
// OAuthClient 인터페이스
public interface OAuthClient {
    AuthProvider getProvider();
    OAuthUserInfo getUserInfo(String code);
}

// 소셜별 구현체 (KakaoOAuthClient, GoogleOAuthClient)
@Component
public class KakaoOAuthClient implements OAuthClient { ... }
```

## chat 도메인 특이사항

`chat` 도메인은 DB를 사용하지 않음 — WebSocket 세션을 `RoomSessionService`(ConcurrentHashMap)가 인메모리로 관리.
- entity, repository 생성 금지
- `ChatController`는 `@RestController` 아닌 `@Controller` 사용

## 페이지네이션

```java
@GetMapping
public ResponseEntity<Page<DomainResponse>> list(
    @PageableDefault(size = 20, sort = "id", direction = DESC) Pageable pageable) {
    return ResponseEntity.ok(service.findAll(pageable));
}
```

## 연관 관계

```java
// Member 참조
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id", nullable = false)
private Member member;

// Channel 참조
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "channel_id", nullable = false)
private Channel channel;
```

## 실행 확인

```bash
cd src/apps/server
./gradlew compileJava   # 컴파일만
./gradlew test          # 테스트
./gradlew bootRun       # 서버 실행 (Windows: gradlew.bat)
```
