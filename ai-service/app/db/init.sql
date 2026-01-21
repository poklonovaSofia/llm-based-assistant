CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    agent_name TEXT,
    filename TEXT,
    content TEXT,
    metadata JSONB,
    embedding vector(384)
);

CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
