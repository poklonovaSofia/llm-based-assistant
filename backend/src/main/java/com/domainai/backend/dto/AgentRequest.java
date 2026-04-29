package com.domainai.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentRequest {

    @NotBlank(message = "Názov agenta je povinný")
    @Size(min = 3, max = 200)
    private String name;

    @Size(max = 1000)
    private String description;

    private Boolean isPublic = false;
}