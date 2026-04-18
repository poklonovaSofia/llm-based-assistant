package com.domainai.backend.dto.agent;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentResponse {
    private Long id;
    private String name;
    private String description;
    private boolean isPublic;
    private String creatorEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}