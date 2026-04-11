package com.domainai.backend.repository;

import com.domainai.backend.entity.Agent;
import com.domainai.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    List<Agent> findAllByCreator(User creator);

    List<Agent> findAllByIsPublicTrue();

    List<Agent> findByNameContainingIgnoreCase(String name);

    boolean existsByCreatorAndNameIgnoreCase(User creator, String name);
}