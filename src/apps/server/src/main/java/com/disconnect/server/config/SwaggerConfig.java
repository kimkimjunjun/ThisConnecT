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

                                ---

                                ### 메시지 형식

                                **ChatMessageResponse**
                                ```json
                                {
                                  "type": "CHAT | JOIN | LEAVE",
                                  "roomId": 1,
                                  "sender": "닉네임",
                                  "content": "메시지 내용",
                                  "timestamp": "2024-01-01T12:00:00"
                                }
                                ```

                                **ParticipantListResponse**
                                ```json
                                {
                                  "roomId": 1,
                                  "count": 3,
                                  "participants": ["닉네임1", "닉네임2", "닉네임3"]
                                }
                                ```
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
