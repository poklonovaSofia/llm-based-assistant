package com.domainai.backend.service;

import com.domainai.backend.models.Agent;
import com.domainai.backend.models.Chat;
import com.domainai.backend.models.Message;
import com.domainai.backend.models.User;
import com.domainai.backend.repository.MessageRepository;
import com.domainai.backend.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final AgentService agentService;
    private final RestTemplate restTemplate;

    public Chat getOrCreateChat(Long agentId, User user) {
        return chatRepository.findByAgentIdAndUserId(agentId, user.getId())
                .orElseGet(() -> {
                    Agent agent = agentService.getAgentById(agentId);
                    Chat chat = Chat.builder()
                            .agent(agent)
                            .user(user)
                            .build();
                    return chatRepository.save(chat);
                });
    }

    public Message sendMessage(Long agentId, String question, User user) {
        Chat chat = getOrCreateChat(agentId, user);
        Agent agent = chat.getAgent();

        // Відправляємо запит до FastAPI
        String fastApiUrl = "http://localhost:8000/ask";
        Map<String, String> request = Map.of(
                "query", question,
                "agent_name", agent.getName()
        );

        Map<String, Object> response = restTemplate.postForObject(
                fastApiUrl,
                request,
                Map.class
        );

        String answer = response != null ? (String) response.get("answer") : "No response";

        Message message = Message.builder()
                .chat(chat)
                .question(question)
                .answer(answer)
                .build();

        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(Long agentId, User user) {
        Chat chat = getOrCreateChat(agentId, user);
        return messageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId());
    }
}