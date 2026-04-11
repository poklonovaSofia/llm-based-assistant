package com.domainai.backend.controller;

import com.domainai.backend.dto.agent.AgentRequest;
import com.domainai.backend.dto.agent.AgentRequest;
import com.domainai.backend.entity.Agent;
import com.domainai.backend.entity.User;
import com.domainai.backend.service.AgentService;
import com.domainai.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<AgentRequest> createAgent(
            @Valid @RequestBody AgentRequest request,
            Authentication authentication) {

        User currentUser = userService.getCurrentUser(authentication.getName());

        Agent agent = Agent.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isPublic(request.isPublic())
                .creator(currentUser)
                .build();

        Agent saved = agentService.createAgent(agent);
        return new ResponseEntity<>(mapToDto(saved), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AgentRequest>> getMyAgents(Authentication authentication) {
        User currentUser = userService.getCurrentUser(authentication.getName());
        List<Agent> agents = agentService.getAgentsByUser(currentUser);

        List<AgentRequest> dtos = agents.stream()
                .map(this::mapToDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/public")
    public ResponseEntity<List<AgentRequest>> getPublicAgents() {
        List<Agent> agents = agentService.getPublicAgents();
        List<AgentRequest> dtos = agents.stream()
                .map(this::mapToDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgentRequest> getAgentById(@PathVariable Long id) {
        Agent agent = agentService.getAgentById(id);
        return ResponseEntity.ok(mapToDto(agent));
    }

    // Jednoduché mapovanie
    private AgentRequest mapToDto(Agent agent) {
        return AgentRequest.builder()
                .id(agent.getId())
                .name(agent.getName())
                .description(agent.getDescription())
                .isPublic(agent.isPublic())
                .creatorEmail(agent.getCreator().getEmail())
                .createdAt(agent.getCreatedAt())
                .updatedAt(agent.getUpdatedAt())
                .build();
    }
}