# BE 상세 컨벤션

## 응답 패턴

```java
// 성공: ResponseEntity.ok(data)
// 생성: ResponseEntity.status(HttpStatus.CREATED).body(data)
// 204: ResponseEntity.noContent().build()
```

## CORS 설정
`WebConfig.java`의 `CorsConfigurationSource`가 `${ALLOWED_ORIGINS}` 환경변수를 읽음.
로컬: `http://localhost:3000`, 배포: 실제 도메인 설정 필요.

## 예외 처리
```java
// 리소스 없음
throw new RuntimeException("Domain not found: " + id);
// 또는 커스텀 예외 클래스 생성 권장
```

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
// Member 참조 시
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id", nullable = false)
private Member member;

// Channel 참조 시
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "channel_id", nullable = false)
private Channel channel;
```

## 실행 확인
```bash
cd src/apps/server && ./gradlew compileJava  # 컴파일만
./gradlew test                                # 테스트
```
