package com.domainai.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private String question;
    private String answer;
    private LocalDateTime createdAt;
}