package com.domainai.backend.controller;

import com.domainai.backend.models.Agent;
import com.domainai.backend.service.AgentService;
import com.domainai.backend.service.DocumentService;
import com.domainai.backend.service.UserService;
import com.domainai.backend.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final AgentService agentService;
    private final UserService userService;

    @GetMapping("/{agentId}")
    public ResponseEntity<List<String>> getDocuments(
            @PathVariable Long agentId,
            Authentication authentication) {

        userService.getCurrentUser(authentication.getName());
        Agent agent = agentService.getAgentById(agentId);
        List<String> documents = documentService.getDocumentsByAgentName(agent.getName());
        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/{agentId}/{filename}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long agentId,
            @PathVariable String filename,
            Authentication authentication) {

        userService.getCurrentUser(authentication.getName());
        Agent agent = agentService.getAgentById(agentId);
        documentService.deleteDocument(agent.getName(), filename);
        return ResponseEntity.ok().build();
    }
}