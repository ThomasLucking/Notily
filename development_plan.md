# Notes App — Development Plan

A phased, conceptual roadmap for building the AI-powered notes app. Each phase builds on the last and results in a working, shippable version of the app.

---

## Phase 0 — Project Setup

**Goal:** Empty shell that runs.

- Initialize a monorepo structure (`apps/web`, `apps/api`, `packages/shared`)
- Set up Bun as the runtime
- Scaffold a Vite + React app in `apps/web`
- Scaffold an Elysia server in `apps/api` with a single health-check route
- Confirm the frontend can call the API (a simple `GET /ping → "pong"`)
- Set up GitHub repo + GitHub Projects board (To Do / In Progress / Done)
- Set up linting (Biome is fast and Bun-friendly)

**Done when:** You can run both apps locally, the frontend fetches from the API, and your repo is live on GitHub with a project board.

---

## Phase 1 — Notes CRUD

**Goal:** A functional notes app with no AI, no auth — just notes.

### Database
- Spin up a local PostgreSQL instance (Docker or native)
- Define the `notes` table schema in Drizzle (`id`, `title`, `content`, `createdAt`, `updatedAt`)
- Run your first migration

### API
- Build notes routes in Elysia: `GET /notes`, `GET /notes/:id`, `POST /notes`, `PUT /notes/:id`, `DELETE /notes/:id`
- Define shared type schemas in `packages/shared` that both frontend and backend import
- Validate request bodies using Elysia's typebox schemas

### Frontend
- Set up TanStack Query with a query client
- Build a notes list view (fetches all notes)
- Build a note editor view (create / edit a single note)
- Wire up mutations for create, update, delete
- Add optimistic updates so the UI feels instant

**Done when:** You can create, read, edit, and delete notes through the UI, and data persists in PostgreSQL.

---

## Phase 2 — Authentication

**Goal:** Users can sign up, log in, and only see their own notes.

### Auth system
- Choose your approach: Better Auth (you already know it) or cookie-based sessions with `Bun.password.hash()`
- Add a `users` table (`id`, `email`, `passwordHash`, `createdAt`)
- Add a `userId` foreign key to the `notes` table
- Build signup and login routes

### Middleware
- Create an Elysia auth middleware that reads the session cookie and attaches `user` to the request context
- Protect all notes routes behind the middleware
- Scope all queries to the authenticated user (`WHERE userId = ?`)

### Frontend
- Build login and signup pages
- Handle session state (redirect to login if unauthenticated)
- Pass credentials/cookies with TanStack Query requests

**Done when:** Two different users can sign up, log in, and each see only their own notes.

---

## Phase 3 — AI Chat (Basic)

**Goal:** Users can chat with an AI about their notes.

### API
- Add a `POST /chat` route
- On each chat request: fetch the user's notes from the DB, build a system prompt that includes them as context, call the Anthropic API
- Return the AI's response

### System prompt
- Create a `prompt.ts` module with modular prompt construction
- Base persona ("you are a notes assistant")
- Note context section (inject note titles + content)
- Keep it simple — no RAG yet, just stuff all notes into the prompt

### Frontend
- Build a chat UI component (message list + input)
- Send user messages to `POST /chat`
- Display AI responses

**Done when:** You can ask the AI a question and it answers based on your actual notes.

---

## Phase 4 — Streaming

**Goal:** AI responses appear token-by-token instead of all at once.

### API
- Refactor `POST /chat` to use Elysia's generator function (`function*`)
- Switch to `anthropic.messages.stream()` in the Anthropic SDK
- Yield each token as it arrives via SSE

### Frontend
- Replace the TanStack Query call for chat with a raw `fetch` + readable stream
- Append each chunk to the displayed message in real time
- Add a typing indicator / loading state while streaming

**Done when:** When the AI responds, text appears word-by-word in the chat UI.

---

## Phase 5 — Note Relationships (Knowledge Graph)

**Goal:** Notes can link to other notes, forming a graph.

### Database
- Add a `note_links` table (`sourceNoteId`, `targetNoteId`, `relationship`)
- Relationship is a label like "related to", "expands on", "contradicts"

### Manual linking
- Support `[[Note Title]]` wiki-link syntax in the note editor
- On save, parse the content for `[[...]]` patterns
- Look up matching notes by title, create link records in `note_links`
- Render wiki-links as clickable links in the note view

### AI-powered linking
- When a note is saved, send it + a list of existing note titles/summaries to Claude
- Ask Claude to suggest connections (returns JSON with note IDs + reasons)
- Show suggestions to the user as dismissable cards
- On accept, create the link record

### Graph-aware context
- When the user chats about a specific note, also fetch linked notes (1 hop)
- Include the linked notes in the system prompt so the AI understands relationships

**Done when:** Notes can link to each other (manually and via AI suggestions), and the AI references connected notes in chat.

---

## Phase 6 — Graph Visualization

**Goal:** An interactive visual map of all notes and their connections.

### Data endpoint
- Add a `GET /graph` route that returns all notes as nodes and all links as edges
- Shape: `{ nodes: [{ id, title, linkCount }], edges: [{ source, target, relationship }] }`

### Visualization
- Use D3's force simulation (`d3-force`) in a React component
- Nodes = circles sized by connection count, edges = lines between them
- Add zoom, pan, click-to-open-note, hover-to-preview
- Color-code by tag or AI-detected cluster (optional, can come later)

**Done when:** There's a visual graph page where you can see and navigate your note connections.

---

## Phase 7 — AI-Suggested Notes

**Goal:** The AI proactively suggests new notes the user might want to write.

### Suggestion engine
- Build a function that sends recent notes to Claude and asks for gap analysis
- Prompt: "What topics are hinted at but never fully explored? What follow-up notes would be valuable?"
- Returns structured suggestions: `{ title, reason, relatedNoteIds }`

### Trigger
- Run suggestions when the user opens the app (or on a button press)
- Cache suggestions so you're not calling the API on every page load

### Frontend
- Display suggestions as cards on the home screen or a dedicated "Ideas" tab
- Each card shows the suggested title, why the AI thinks it's worth writing, and which existing notes it relates to
- "Start writing" button creates a new note pre-titled and pre-linked

**Done when:** The app suggests new notes based on patterns in existing ones, and the user can create them with one click.

---

## Phase 8 — Search & RAG

**Goal:** Smart retrieval so the AI doesn't need every note stuffed into the prompt.

### Full-text search
- Enable PostgreSQL full-text search on notes (`tsvector` column + GIN index)
- Add a `GET /search?q=...` endpoint
- Wire up a search bar in the frontend

### RAG for chat
- When the user sends a chat message, search for the most relevant notes first (keyword match or full-text search)
- Only inject the top N relevant notes into the prompt instead of all of them
- This keeps the prompt focused and allows the app to scale to hundreds/thousands of notes

### Future: vector search
- Add `pgvector` extension to PostgreSQL
- Generate embeddings for each note (via an embedding API)
- Replace keyword search with semantic similarity search
- This is optional and can come much later — full-text search gets you very far

**Done when:** Chat uses smart retrieval instead of dumping all notes, and users can search their notes by keyword.

---

## Deployment

This can happen at any point after Phase 1 — don't wait until everything is done.

- **API + DB:** Railway or Fly.io (both support Bun + PostgreSQL)
- **Frontend:** Vercel or Cloudflare Pages (static Vite build)
- **Environment variables:** Anthropic API key, database URL, session secret
- Set up a basic CI pipeline (GitHub Actions) that runs lint + build on push

---

## Guiding Principles

1. **Ship early, iterate often.** Each phase is a working app. Deploy after Phase 1.
2. **Don't optimize prematurely.** Start with all notes in the prompt. Add RAG only when it becomes a bottleneck.
3. **One feature at a time.** Finish a phase before starting the next. Resist the urge to jump ahead.
4. **Write about what you build.** A short post per phase builds a portfolio and forces you to understand what you did.
5. **Use GitHub Projects.** Break each phase into small tasks (1–3 hours each). Move them across the board.