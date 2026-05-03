package com.domainai.backend.controller;
import com.domainai.backend.dto.MessageRequest;
import com.domainai.backend.dto.MessageResponse;
import com.domainai.backend.models.Message;
import com.domainai.backend.models.User;
import com.domainai.backend.service.ChatService;
import com.domainai.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    @PostMapping("/{agentId}/message")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable Long agentId,
            @RequestBody MessageRequest request,
            Authentication authentication) {
        System.out.println("Hi");
        User user = userService.getCurrentUser(authentication.getName());
        Message message = chatService.sendMessage(agentId, request.getQuestion(), user);

        return ResponseEntity.ok(MessageResponse.builder()
                .id(message.getId())
                .question(message.getQuestion())
                .answer(message.getAnswer())
                .createdAt(message.getCreatedAt())
                .build());
    }

    @GetMapping("/{agentId}/history")
    public ResponseEntity<List<MessageResponse>> getChatHistory(
            @PathVariable Long agentId,
            Authentication authentication) {
        System.out.println("hi");
        User user = userService.getCurrentUser(authentication.getName());
        List<Message> messages = chatService.getChatHistory(agentId, user);

        List<MessageResponse> response = messages.stream()
                .map(m -> MessageResponse.builder()
                        .id(m.getId())
                        .question(m.getQuestion())
                        .answer(m.getAnswer())
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(response);
    }
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Chat controller works!");
    }
}