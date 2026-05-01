# Librex

> Multi-agent web platform as a private knowledge library using local RAG

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot&logoColor=white&style=flat-square)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white&style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white&style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white&style=flat-square)

Librex lets you build specialized AI agents trained on your own documents — keep them private or share with the community.

---

## Requirements

- Docker + Docker Compose
- Ollama with your model pulled:

```bash
ollama pull openeurollm-slovak-ctx16k
```
## Model

This project uses [`openeurollm-slovak-ctx16k`](https://huggingface.co/openEuroLLM) — a Gemma3 fine-tune optimized for Slovak language with 16k context window.

The model was run with extended context (`num_ctx=16384`) via Ollama on a VM with 32GB RAM / 16 vCPU.

Any Ollama-compatible model can be used by changing `OLLAMA_MODEL` in `.env`.

---

## Quickstart

```bash
git clone 
cd ai-system
cp .env.example .env
# edit .env — set OLLAMA_BASE_URL and JWT_SECRET
docker compose up --build
```

Open http://localhost:5173

---

## Configuration

Copy `.env.example` to `.env` and fill in:

```dotenv
POSTGRES_USER=vectorDB
POSTGRES_PASSWORD=vectorDB
POSTGRES_DB=vectorDB
DATABASE_URL=postgresql://vectorDB:vectorDB@postgres:5432/vectorDB

LLM_PROVIDER=ollama
OLLAMA_MODEL=openeurollm-slovak-ctx16k

# Remote server
OLLAMA_BASE_URL=http://<server-ip>:11434
# Local (Windows/Mac)
# OLLAMA_BASE_URL=http://host.docker.internal:11434

JWT_SECRET=your_secret_here
```

---

## Architecture

```
Browser → nginx (5173)
             ├── /api/*     → Spring Boot (8080) → FastAPI (8000) → Ollama
             ├── /ingest-*  → FastAPI (8000) → PostgreSQL + pgvector
             └── /*         → React SPA
```

---

## RAG Pipeline

Query → rewrite → HyDE → hybrid search (vector + tsvector) → RRF → rerank → answer

---

## Evaluation

| Metric | Pharma RAG | Pharma Base | CSIRT RAG | CSIRT Base |
|---|---|---|---|---|
| Faithfulness | 0.983 | — | 0.950 | — |
| Answer Relevancy | 0.768 | 0.401 | 0.603 | 0.461 |
| Context Precision | 0.820 | — | 0.811 | — |
| Answer Correctness | 0.810 | 0.419 | 0.916 | 0.380 |

Wilcoxon signed-rank test: p < 0.001 (n=25)
