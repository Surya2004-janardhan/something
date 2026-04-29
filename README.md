# Agents — Microservices Platform

A full-stack microservices platform built with **Node.js / TypeScript** backends (with a small Node AI worker) and a **Next.js** frontend, fully containerised with Docker Compose. The system prefers Node/TypeScript; the AI worker is a dedicated Node service that calls multiple LLM providers.

## Architecture

```
┌─────────────┐     HTTP      ┌──────────────┐
│  Next.js UI │──────────────▶│  Nginx Gate  │
│  (port 3000)│               │  (port  80)  │
└─────────────┘               └──────┬───────┘
                                      │  reverse-proxy
              ┌───────────────────────┼────────────────────┐
              ▼                       ▼                     ▼
        ┌──────────┐          ┌────────────┐      ┌──────────────┐
        │   auth   │          │   agents   │      │  workflows   │
        │ :5001    │          │   :5002    │      │   :5003      │
        └──────────┘          └────────────┘      └──────────────┘
              │                       │                     │
              └───────────┬───────────┘                     │
                          ▼                                  ▼
                   ┌────────────┐                  ┌──────────────────┐
                   │  Postgres  │                  │  notifications   │
                   │  Redis     │                  │     :5004        │
                   └────────────┘                  └──────────────────┘
```

## Services

| Service         | Port  | Description                              |
|-----------------|-------|------------------------------------------|
| frontend        | 3000  | Next.js App Router UI                    |
| gateway         | 80    | Nginx reverse-proxy / API gateway        |
| auth            | 5001  | JWT authentication & user management     |
| agents          | 5002  | AI agent orchestration                   |
| workflows       | 5003  | Workflow definitions & execution         |
| notifications   | 5004  | Email / webhook notifications            |
| postgres        | 5432  | Shared relational database               |
| redis           | 6379  | Cache & message broker                   |

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start all services
docker compose up --build

# 3. Open the UI
open http://localhost:3000
```

## Development

Each backend service can be run independently:

```bash
cd backend/auth
pip install -r requirements.txt
python main.py
```

The frontend can be run with:

```bash
cd frontend
npm install
npm run dev
```

## Folder Structure

```
agents/
├── docker-compose.yml
├── .env.example
├── frontend/          # Next.js 14 App Router
└── backend/
    ├── shared/        # Shared Python utilities
    ├── auth/          # Auth microservice  (Flask, port 5001)
    ├── agents/        # Agents microservice (Flask, port 5002)
    ├── workflows/     # Workflows microservice (Flask, port 5003)
    ├── notifications/ # Notifications microservice (Flask, port 5004)
    └── gateway/       # Nginx reverse-proxy
```

## Notes

- The AI LLM worker has been migrated to a Node-based `ai-worker` service (internal). The Node API (`node-api`) calls this internal worker at the URL provided in `AI_WORKER_URL`.
- Supported LLM providers: OpenAI, Anthropic, Google Gemini, Mistral, Cohere, Groq, Together, Ollama (local), Azure, OpenRouter and custom OpenAI-compatible endpoints. Configure provider API keys in `.env`.
- The platform uses Redis for caching, job status and rate-limiting; ensure `REDIS_URL` is set.

