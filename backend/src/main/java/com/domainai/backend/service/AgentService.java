package com.domainai.backend.service;

import com.domainai.backend.models.Agent;
import com.domainai.backend.models.User;
import com.domainai.backend.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AgentService {

    private final AgentRepository agentRepository;
    public Agent createAgent(Agent agent) {
        return agentRepository.save(agent);
    }

    @Transactional(readOnly = true)
    public Agent getAgentById(Long id) {
        return agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent s id " + id + " nebol nájdený"));
    }

    @Transactional(readOnly = true)
    public List<Agent> getAgentsByUser(User user) {
        return agentRepository.findAllByCreator(user);
    }

    @Transactional(readOnly = true)
    public List<Agent> getPublicAgents() {
        return agentRepository.findAllByIsPublicTrue();
    }

    public Agent updateAgent(Agent agent) {
        return agentRepository.save(agent);
    }

    public void deleteAgent(Long id) {
        agentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean existsByUserAndName(User user, String name) {
        return agentRepository.existsByCreatorAndNameIgnoreCase(user, name);
    }
}