package com.disconnect.server.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Disconnect API")
                        .version("v1")
                        .description("""
                                ## REST API
                                JWT Bearer 토큰 인증이 필요한 엔드포인트는 우측 상단 **Authorize** 버튼에서 토큰을 입력하세요.

                                ---

                                ## WebSocket (STOMP)

                                **연결 엔드포인트**
                                ```
                                ws://localhost:8080/ws
                                ```

                                **인증**
                                STOMP CONNECT 프레임 헤더에 JWT 토큰을 포함합니다.
                                ```
                                Authorization: Bearer <accessToken>
                                ```

                                ---

                                ### 구독 (Subscribe)

                                | Destination | 설명 | 수신 타입 |
                                |---|---|---|
                                | `/sub/rooms/{roomId}/chat` | 채팅 메시지 수신 | `ChatMessageResponse` |
                                | `/sub/rooms/{roomId}/participants` | 참여자 목록 수신 | `ParticipantListResponse` |

                                ---

                                ### 발행 (Publish)

                                | Destination | 설명 | 전송 바디 |
                                |---|---|---|
                                | `/pub/rooms/{roomId}/enter` | 채팅방 입장 | 없음 |
                                | `/pub/rooms/{roomId}/chat` | 채팅 메시지 전송 | `{ "content": "메시지" }` |
                                | `/pub/rooms/{roomId}/voice/signal` | WebRTC 시그널링 전송 | `VoiceSignalRequest` |

                                ---

                                ### 메시지 형식

                                **ChatMessageResponse**
                                ```json
                                {
                                  "type": "CHAT | JOIN | LEAVE",
                                  "roomId": 1,
                                  "sender": "닉네임",
                                  "content": "메시지 내용",
                                  "timestamp": "2024-01-01T12:00:00",
                                  "sessionId": "세션ID (JOIN/LEAVE 시에만 설정)"
                                }
                                ```

                                **ParticipantListResponse**
                                ```json
                                {
                                  "roomId": 1,
                                  "count": 2,
                                  "participants": [
                                    { "sessionId": "abc123", "nickname": "닉네임1" },
                                    { "sessionId": "def456", "nickname": "닉네임2" }
                                  ]
                                }
                                ```

                                ---

                                ## WebRTC 음성채팅 (시그널링)

                                실제 오디오 스트림은 브라우저 간 P2P로 전송됩니다.
                                서버는 시그널링 메시지(Offer/Answer/ICE Candidate)만 중계합니다.

                                **음성채팅 흐름**
                                1. 입장 시 참여자 목록(`sessionId` 포함)을 수신
                                2. 기존 참여자 각각에게 `OFFER` 전송 (`/pub/rooms/{roomId}/voice/signal`)
                                3. 상대방은 `/sub/rooms/{roomId}/voice`에서 수신 후 `targetSessionId`가 자신의 것이면 `ANSWER` 반환
                                4. `ICE_CANDIDATE` 교환으로 P2P 연결 완성
                                5. 이후 오디오 스트림은 WebRTC로 직접 전송

                                **VoiceSignalRequest** (클라이언트 → 서버)
                                ```json
                                {
                                  "type": "OFFER | ANSWER | ICE_CANDIDATE",
                                  "targetSessionId": "상대방 sessionId",
                                  "data": { "sdp": "..." }
                                }
                                ```

                                **VoiceSignalResponse** (서버 → 클라이언트, `/sub/rooms/{roomId}/voice`)
                                ```json
                                {
                                  "type": "OFFER | ANSWER | ICE_CANDIDATE",
                                  "senderSessionId": "보낸 사람 sessionId",
                                  "targetSessionId": "받는 사람 sessionId",
                                  "data": { "sdp": "..." }
                                }
                                ```
                                > 클라이언트는 `targetSessionId === 내 sessionId`인 메시지만 처리합니다.
                                """))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .tags(List.of(
                        new Tag().name("WebSocket").description(
                                "STOMP 기반 실시간 채팅 API — 위 REST API 설명 섹션의 WebSocket 항목을 참조하세요."
                        )
                ));
    }
}
