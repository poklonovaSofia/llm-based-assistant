package com.domainai.backend.service;

import com.domainai.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    public List<String> getDocumentsByAgentName(String agentName) {
        return documentRepository.findDistinctFilenamesByAgentName(agentName);
    }

    @Transactional
    public void deleteDocument(String agentName, String filename) {
        documentRepository.deleteByAgentNameAndFilename(agentName, filename);
    }
}