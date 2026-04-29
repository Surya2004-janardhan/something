# Agents — Microservices Platform

A production-ready **Node.js / TypeScript** microservices platform with a **Next.js** frontend, built on Docker Compose. Provides AI agent orchestration, workflow automation, authentication, and notifications with support for multiple LLM providers (OpenAI, Anthropic, Google Gemini, Mistral, Azure, Ollama, and custom endpoints).

**Features:**
- 🤖 Multi-provider LLM support with intelligent routing
- 🔄 Workflow automation with scheduling
- 🔐 JWT-based authentication & user management
- 📨 Email & webhook notifications
- ⚡ Redis-powered caching & job queuing
- 🚀 Fully containerized with Docker Compose
- 📱 Modern Next.js 15 frontend with studio UI
- 🛠️ TypeScript for type safety across the stack

---

## Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Services Overview](#services-overview)
- [API Documentation](#api-documentation)
- [Development](#development)
- [LLM Providers](#llm-providers)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (port 3000)             │
│                   Modern Studio UI + Workflows              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                    ┌──────▼──────┐
                    │ Nginx Gate  │ (port 80)
                    │ (reverse    │
                    │ proxy)      │
                    └──────┬──────┘
          ┌─────────────────┼─────────────────┐
          │                 │                 │
     ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────────┐
     │  node-api │──▶ │ ai-worker  │   │ Auth Service   │
     │ :5000 TS  │    │ :5000 Node │   │ (Flask) :5001  │
     └────┬─────┘    └─────┬──────┘   └────────────────┘
          │                 │
     ┌────▼──────────┐  ┌───▼────────────────┐
     │ Agents Service│  │ Workflows Service  │
     │ (Flask):5002  │  │ (Flask) :5003      │
     └────┬──────────┘  └────┬───────────────┘
          │                  │
     ┌────▼──────────┐  ┌────▼────────────────┐
     │ Notifications │  │ Shared Services    │
     │ (Flask):5004  │  │ (Middleware, Utils)│
     └────┬──────────┘  └────────────────────┘
          │
     ┌────┼──────────────────┬──────────────┐
     │    │                  │              │
┌────▼──┐│  ┌────────────┐  ┌───────────┐   │
│ Redis ││  │ PostgreSQL │  │  Dify     │   │
│:6379  ││  │ (Neon):5432│  │(Reference)│   │
└───────┘│  └────────────┘  └───────────┘   │
         │                                    │
         └────────────────────────────────────┘
              Data Layer & Integration
```

**Key Components:**

- **Frontend**: Next.js 15 with App Router; modern, responsive studio UI
- **Gateway**: Nginx reverse proxy routing to microservices
- **node-api**: TypeScript/Express entry point for agents/workflows
- **ai-worker**: Internal Node.js service for LLM execution & job management
- **Backend Services**: Python Flask microservices (auth, agents, workflows, notifications)
- **Data Layer**: PostgreSQL (Neon), Redis (caching & job state)

---

## Quick Start

### Prerequisites

- **Docker** & **Docker Compose** (v2.0+)
- **git**
- Optional: Node.js 20+ (for local development)

### 1. Clone & Setup

```bash
git clone <repo-url>
cd something
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with your LLM provider keys and database URL:

```bash
# LLM Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://user:pass@host/dbname"

# Redis
REDIS_URL="redis://redis:6379"

# JWT secret
JWT_SECRET=your-secret-key-here

# AI Worker (internal)
AI_WORKER_URL="http://ai-worker:5000"
```

### 3. Start Services

```bash
# Build and start all services
docker compose up --build

# Or just start (if already built)
docker compose up

# View logs
docker compose logs -f node-api
docker compose logs -f ai-worker
```

### 4. Open UI

- **Frontend**: http://localhost:3000
- **API**: http://localhost/api (via Nginx gateway)

---

## Environment Setup

### Required Variables

| Variable             | Description                                | Example / Default              |
|----------------------|--------------------------------------------|--------------------------------|
| `DATABASE_URL`       | PostgreSQL connection string               | `postgresql://...`             |
| `REDIS_URL`          | Redis connection string                    | `redis://redis:6379`           |
| `JWT_SECRET`         | Secret for signing JWTs                    | Any strong random string       |
| `AI_WORKER_URL`      | Internal URL to ai-worker                  | `http://ai-worker:5000`        |

### LLM Provider Keys (Optional but recommended)

| Provider        | Env Var             | Get Key From                           |
|-----------------|---------------------|----------------------------------------|
| OpenAI          | `OPENAI_API_KEY`    | https://platform.openai.com/api-keys   |
| Anthropic       | `ANTHROPIC_API_KEY` | https://console.anthropic.com           |
| Google Gemini   | `GOOGLE_API_KEY`    | https://makersuite.google.com/app/apikey |
| Mistral         | `MISTRAL_API_KEY`   | https://console.mistral.ai              |
| Cohere          | `COHERE_API_KEY`    | https://dashboard.cohere.com            |
| Groq            | `GROQ_API_KEY`      | https://console.groq.com                |
| Azure OpenAI    | `AZURE_OPENAI_KEY` / `AZURE_ENDPOINT` | Azure portal |
| Ollama (local)  | –                   | Run locally; set `OLLAMA_ENDPOINT`     |

---

## Project Structure

```
.
├── docker-compose.yml          # Service orchestration
├── .env.example                # Environment template
├── README.md                   # This file
├── frontend/                   # Next.js 15 frontend
│   ├── src/app/
│   │   ├── page.tsx           # Main studio UI
│   │   ├── layout.tsx         # Global layout
│   │   └── globals.css        # Global styles
│   ├── src/lib/
│   │   ├── agentsClient.ts    # Agent API client
│   │   ├── workflowsClient.ts # Workflow API client
│   │   └── providerCatalog.ts # LLM provider definitions
│   ├── package.json           # Frontend dependencies
│   └── tsconfig.json          # TypeScript config
│
├── backend/
│   ├── shared/                # Shared Python utilities
│   │   ├── middlewares/       # Auth, CORS, etc.
│   │   ├── models/            # Base models & schemas
│   │   └── utils/             # JWT, logging, helpers
│   │
│   ├── node-api/              # TypeScript/Express (port 3000 dev, proxied via gateway)
│   │   ├── src/
│   │   │   ├── index.ts       # Express app entry
│   │   │   ├── lib/
│   │   │   │   ├── providers.ts   # LLM provider catalog
│   │   │   │   ├── llm.ts         # LLM execution logic
│   │   │   │   └── prisma.ts      # DB client
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   │   ├── agents.ts      # Agent endpoints
│   │   │   │   ├── workflows.ts   # Workflow endpoints
│   │   │   │   ├── ai.ts          # Provider list endpoint
│   │   │   │   └── runs.ts        # Run status & history
│   │   │   └── types/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── node-worker/           # Node.js AI job runner (internal, port 5000)
│   │   ├── index.js           # Express app
│   │   ├── routes/jobs.js     # Job creation/status endpoints
│   │   ├── lib/llm.js         # LLM provider adapters
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── auth/                  # Flask Auth service (port 5001)
│   │   ├── main.py
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── agents/                # Flask Agents service (port 5002)
│   │   ├── main.py
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── workflows/             # Flask Workflows service (port 5003)
│   │   ├── main.py
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── notifications/         # Flask Notifications service (port 5004)
│   │   ├── main.py
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   └── gateway/               # Nginx reverse proxy
│       └── nginx.conf
│
└── dify/                      # Reference implementation (optional)
    └── [dify repo clone]
```

---

## Services Overview

| Service          | Language   | Port   | Role                                     |
|------------------|------------|--------|------------------------------------------|
| **frontend**     | Next.js    | 3000   | Modern UI with studio workflows         |
| **gateway**      | Nginx      | 80     | Reverse proxy & API routing             |
| **node-api**     | TypeScript | –      | Main API; orchestrates agents/workflows |
| **ai-worker**    | Node.js    | 5000   | Internal LLM executor & job manager    |
| **auth**         | Python     | 5001   | JWT auth & user management             |
| **agents**       | Python     | 5002   | AI agent orchestration                 |
| **workflows**    | Python     | 5003   | Workflow definitions & scheduling      |
| **notifications**| Python     | 5004   | Email & webhook notifications          |
| **postgres**     | DB         | 5432   | Primary data store                     |
| **redis**        | Cache      | 6379   | Session storage, job queue, cache      |

---

## API Documentation

### 1. **Providers Endpoint**

Fetch available LLM providers and their settings.

**Request:**
```bash
curl -X GET http://localhost/api/ai/providers \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response:**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "configured": true
    },
    {
      "id": "anthropic",
      "name": "Anthropic Claude",
      "models": ["claude-3-opus", "claude-3-sonnet"],
      "configured": true
    }
  ]
}
```

### 2. **Create an Agent**

Create a new AI agent.

**Request:**
```bash
curl -X POST http://localhost/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "Research Agent",
    "description": "Performs research on topics",
    "system_prompt": "You are a helpful research assistant.",
    "provider": "openai",
    "model": "gpt-4"
  }'
```

**Response:**
```json
{
  "id": "agent_123abc",
  "name": "Research Agent",
  "created_at": "2026-04-29T10:00:00Z"
}
```

### 3. **Run an Agent**

Execute an agent with a prompt.

**Request:**
```bash
curl -X POST http://localhost/api/agents/agent_123abc/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "prompt": "Research the latest AI trends in Q2 2026",
    "max_tokens": 2000
  }'
```

**Response:**
```json
{
  "run_id": "run_456def",
  "agent_id": "agent_123abc",
  "status": "queued",
  "created_at": "2026-04-29T10:01:00Z"
}
```

### 4. **Get Run Status**

Poll for a run's result.

**Request:**
```bash
curl -X GET http://localhost/api/runs/run_456def \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Response:**
```json
{
  "run_id": "run_456def",
  "status": "completed",
  "output": "AI trends in Q2 2026 include...",
  "tokens_used": 1250,
  "completed_at": "2026-04-29T10:02:15Z"
}
```

### 5. **Create a Workflow**

Define a workflow with multiple steps.

**Request:**
```bash
curl -X POST http://localhost/api/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "Email Research Workflow",
    "description": "Research topic, then email results",
    "steps": [
      {
        "type": "agent",
        "agent_id": "agent_123abc",
        "prompt": "Research {{topic}}"
      },
      {
        "type": "notification",
        "method": "email",
        "recipient": "{{email}}",
        "subject": "Research Results"
      }
    ],
    "schedule": "0 9 * * *"
  }'
```

---

## Development

### Local Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`. Changes rebuild automatically.

### Local Node API Development

```bash
cd backend/node-api
npm install
npm run dev
```

Runs on `http://localhost:3000` (or configured port).

### Local Python Services

Each Python service can run independently:

```bash
cd backend/auth
pip install -r requirements.txt
python main.py
```

Then forward requests via Nginx or directly to port 5001.

### Database Migrations

When schema changes occur, run Prisma migrations:

```bash
cd backend/node-api
npx prisma migrate deploy
```

For development, generate a new migration:

```bash
npx prisma migrate dev --name <migration_name>
```

### Running Tests

```bash
# Frontend
cd frontend
npm run test

# Node API
cd backend/node-api
npm run test

# Python services
cd backend/auth
pytest
```

---

## LLM Providers

### Supported Models

| Provider       | Models                           | Requires Auth | Local? |
|----------------|----------------------------------|---------------|--------|
| **OpenAI**     | GPT-4, GPT-3.5 Turbo, o1        | Yes           | No     |
| **Anthropic**  | Claude 3 (Opus, Sonnet, Haiku)  | Yes           | No     |
| **Google**     | Gemini Pro, Gemini Pro Vision   | Yes           | No     |
| **Mistral**    | Mistral Large, Medium, Small    | Yes           | No     |
| **Cohere**     | Command, Command Light          | Yes           | No     |
| **Groq**       | LLaMA 3, Mixtral (fast)         | Yes           | No     |
| **Together**   | 50+ open-source models          | Yes           | No     |
| **Azure**      | GPT-4, GPT-3.5 (via Azure)      | Yes           | No     |
| **OpenRouter** | 200+ models (routing service)   | Yes           | No     |
| **Ollama**     | Local LLMs (LLaMA, Mistral, etc)| No            | Yes    |
| **Custom**     | Any OpenAI-compatible endpoint  | Optional      | Yes    |

### Adding a New Provider

1. **Add API key to `.env`:**
   ```bash
   MY_LLM_API_KEY=...
   ```

2. **Register in `backend/node-api/src/lib/providers.ts`:**
   ```typescript
   export const providers = [
     // ... existing providers
     {
       id: 'my-llm',
       name: 'My LLM',
       models: ['model-1', 'model-2'],
       apiKeyEnv: 'MY_LLM_API_KEY'
     }
   ];
   ```

3. **Add handler in `backend/node-worker/lib/llm.js`:**
   ```javascript
   case 'my-llm':
     return callMyLLM(payload);
   ```

---

## Troubleshooting

### Issue: "Connection refused" to database

**Solution:**
- Ensure `DATABASE_URL` is correct in `.env`
- Check PostgreSQL is running: `docker compose logs postgres`
- Wait 10–15 seconds for Postgres to start
- If using Neon, verify network access & IP allowlist

### Issue: "Cannot read property 'user' of undefined" in node-api

**Solution:**
- Verify JWT_SECRET is set in `.env`
- Check Authorization header is being sent: `Authorization: Bearer <token>`
- Confirm auth middleware is applied to routes

### Issue: LLM calls return 401 Unauthorized

**Solution:**
- Verify API keys are present in `.env` and correct
- Check provider isn't rate-limited
- Ensure model name is valid for that provider
- For OpenAI: use `gpt-4`, not `gpt-4-preview` or other aliases

### Issue: Jobs stuck in "queued" status

**Solution:**
- Check Redis is running: `docker compose logs redis`
- Verify `AI_WORKER_URL` in `.env` is correct
- Check ai-worker logs: `docker compose logs ai-worker`
- Ensure ai-worker has access to LLM keys

### Issue: Next.js build fails with "Module not found"

**Solution:**
- Run `npm install` in `frontend/`
- Clear `.next/` cache: `rm -rf frontend/.next`
- Rebuild: `npm run build`

### Debug Mode

Enable verbose logging:

```bash
# Node API
DEBUG=* npm run dev

# Docker containers
docker compose logs -f --tail=100
```

---

## Contributing

### Code Standards

- **Frontend**: ESLint + Prettier, TypeScript strict mode
- **Node Backend**: ESLint, TypeScript strict mode
- **Python Backend**: Black, flake8, mypy

### Before Committing

```bash
# Install pre-commit hooks (optional)
pre-commit install

# Format code
npm run format

# Run linter
npm run lint

# Run tests
npm test
```

### Deployment

For production, consider:
- Setting `NODE_ENV=production`
- Using a secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Enabling HTTPS with TLS certificates
- Setting resource limits on containers
- Configuring auto-scaling and load balancing
- Running database migrations before service restarts
- Monitoring with Prometheus, Datadog, or similar

---

## License

[Specify your license here]

---

## Support

- **Issues**: Open a GitHub issue
- **Discussions**: Start a GitHub discussion
- **Email**: [support email]

---

**Last Updated:** April 29, 2026  
**Version:** 1.0.0

