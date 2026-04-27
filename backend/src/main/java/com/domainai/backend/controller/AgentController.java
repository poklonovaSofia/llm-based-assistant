package com.domainai.backend.controller;

import com.domainai.backend.dto.agent.AgentRequest;
import com.domainai.backend.dto.agent.AgentResponse;
import com.domainai.backend.models.Agent;
import com.domainai.backend.models.User;
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
    public ResponseEntity<AgentResponse> createAgent(
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
    public ResponseEntity<List<AgentResponse>> getMyAgents(Authentication authentication) {
        User currentUser = userService.getCurrentUser(authentication.getName());
        List<Agent> agents = agentService.getAgentsByUser(currentUser);

        List<AgentResponse> dtos = agents.stream()
                .map(this::mapToDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/public")
    public ResponseEntity<List<AgentResponse>> getPublicAgents() {
        List<Agent> agents = agentService.getPublicAgents();
        List<AgentResponse> dtos = agents.stream()
                .map(this::mapToDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgentResponse> getAgentById(@PathVariable Long id) {
        Agent agent = agentService.getAgentById(id);
        return ResponseEntity.ok(mapToDto(agent));
    }

    private AgentResponse mapToDto(Agent agent) {
        return AgentResponse.builder()
                .id(agent.getId())
                .name(agent.getName())
                .description(agent.getDescription())
                .isPublic(agent.isPublic())
                .creatorEmail(agent.getCreator().getEmail())
                .createdAt(agent.getCreatedAt())
                .updatedAt(agent.getUpdatedAt())
                .build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<AgentResponse> updateAgent(
            @PathVariable Long id,
            @Valid @RequestBody AgentRequest request,
            Authentication authentication) {

        User currentUser = userService.getCurrentUser(authentication.getName());
        Agent agent = agentService.getAgentById(id);

        if (!agent.getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        agent.setName(request.getName());
        agent.setDescription(request.getDescription());
        agent.setPublic(request.isPublic());

        Agent updated = agentService.createAgent(agent);
        return ResponseEntity.ok(mapToDto(updated));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgent(
            @PathVariable Long id,
            Authentication authentication) {

        User currentUser = userService.getCurrentUser(authentication.getName());
        Agent agent = agentService.getAgentById(id);

        if (!agent.getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        agentService.deleteAgent(id);
        return ResponseEntity.ok().build();
    }
}