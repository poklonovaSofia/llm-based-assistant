package com.domainai.backend.repository;

import com.domainai.backend.models.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    @Query("SELECT DISTINCT d.filename FROM Document d WHERE d.agentName = :agentName")
    List<String> findDistinctFilenamesByAgentName(@Param("agentName") String agentName);

    void deleteByAgentNameAndFilename(String agentName, String filename);
}