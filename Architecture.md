# Notes App — Architecture

An AI-powered notes application that lets users create, manage, and **talk to** their notes through an integrated chat interface backed by Claude.

---

## High-Level Overview

The system is organized into four horizontal layers, each with a clear responsibility boundary:

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND          React + Vite (Bun runtime)       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Notes UI   │  │  Chat UI    │  │ TanStack     │ │
│  │  CRUD views │  │  AI convo   │  │ Query client │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘ │
├─────────┼────────────────┼────────────────┼─────────┤
│  API    │   Elysia.js — typesafe server   │         │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐ │
│  │ Notes routes│  │ Chat route  │  │ Type schemas│ │
│  │ REST CRUD   │  │ POST /chat  │  │ shared types│ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘ │
├─────────┼────────────────┼──────────────────────────┤
│  DATA   │                │                          │
│  ┌──────▼──────┐  ┌──────┼──────┐                   │
│  │ Drizzle ORM │──▶│ PostgreSQL │                   │
│  │ query build │  │ notes,users│                    │
│  └─────────────┘  └──────┬──────┘                   │
├──────────────────────────┼──────────────────────────┤
│  AI                      │                          │
│  ┌─────────────┐  ┌──────▼──────┐                   │
│  │Anthropic API│  │ RAG context │                   │
│  │claude-sonnet│◀─│notes as ctx │                   │
│  └─────────────┘  └─────────────┘                   │
└─────────────────────────────────────────────────────┘
```

---

## Layer Breakdown

### 1. Frontend

| Component | Role |
|---|---|
| **Notes UI** | Create, view, edit, and delete notes. The primary CRUD interface. |
| **Chat UI** | Conversational interface where users talk to an AI *about* their notes. |
| **TanStack Query** | Manages all HTTP calls to the API layer — caching, refetching, optimistic updates. |

**Stack:** React + Vite, bundled and served via Bun.

### 2. API

All API routes live inside a single **Elysia.js** server running on Bun, providing end-to-end type safety from request validation to response shapes.

| Route group | Endpoints | Purpose |
|---|---|---|
| **Notes routes** | `GET / POST / PUT / DELETE` | Standard CRUD operations on notes. |
| **Chat route** | `POST /chat` | Accepts a user message, fetches relevant note context, calls the Anthropic API, and streams the response back. |
| **Type schemas** | — | Shared request/response type definitions consumed by both frontend (TanStack Query) and backend. |

### 3. Data

| Component | Role |
|---|---|
| **ORM (Drizzle)** | Typesafe query builder that maps TypeScript types to SQL. Handles migrations and schema definitions. |
| **PostgreSQL** | Primary data store. Houses `notes` and `users` tables (and eventually `chat_history`). |

### 4. AI

| Component | Role |
|---|---|
| **Anthropic API** | LLM endpoint (`claude-sonnet-4-6`) that powers the chat experience. |
| **RAG context** *(planned)* | Notes are fetched from PostgreSQL and injected into the prompt as context so the AI can answer questions grounded in the user's own data. |

---

## Data Flow

### Writing a note
```
Notes UI  →  TanStack Query  →  Elysia (Notes routes)  →  Drizzle  →  PostgreSQL
```

### Chatting with AI about notes
```
Chat UI  →  TanStack Query  →  Elysia (Chat route)
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
                  Anthropic API          RAG context
                  (generates reply)      (fetches relevant notes
                        │                from PostgreSQL)
                        ▼
                  Streamed response  →  Chat UI
```

---

## Planned / Future Work

- **RAG pipeline** — Retrieve and rank relevant notes before injecting them into the prompt. Start simple (keyword / recency), evolve to embeddings + vector search (pgvector) later.
- **Chat history** — Persist conversations in PostgreSQL so users can resume threads.
- **Auth** — User authentication layer (likely cookie-based sessions via Elysia plugin).
- **Real-time** — WebSocket or SSE streaming for chat responses.

---

## Project Structure (proposed)

```
notes-app/
├── packages/
│   └── shared/            # Shared types & schemas
│       └── types.ts
├── apps/
│   ├── web/               # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── notes/
│   │   │   │   └── chat/
│   │   │   ├── hooks/     # TanStack Query hooks
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   └── api/               # Elysia.js backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── notes.ts
│       │   │   └── chat.ts
│       │   ├── db/
│       │   │   ├── schema.ts   # Drizzle schema
│       │   │   └── client.ts
│       │   └── ai/
│       │       └── prompt.ts   # Prompt construction + RAG
│       └── index.ts
├── drizzle.config.ts
└── package.json
```