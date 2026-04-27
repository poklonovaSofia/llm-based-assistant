package com.domainai.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agent_name")
    private String agentName;

    private String filename;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
}