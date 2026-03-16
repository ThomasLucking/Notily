# Phase 0 — Project Setup (Detailed)

Everything you need to go from empty folder to a deployable monorepo with CI/CD, versioning, and a clean development workflow.

---

## Monorepo Structure

```
notes-app/
├── apps/
│   ├── web/                    # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── lib/            # API client, utils
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── api/                    # Elysia.js backend
│       ├── src/
│       │   ├── routes/
│       │   ├── db/
│       │   ├── middleware/
│       │   ├── ai/
│       │   └── index.ts
│       ├── drizzle.config.ts
│       ├── Dockerfile
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/                 # Shared types, schemas, constants
│       ├── src/
│       │   └── types.ts
│       ├── tsconfig.json
│       └── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint + typecheck + build on every push
│       └── deploy.yml          # Deploy to Railway on release
├── .gitignore
├── biome.json                  # Linter + formatter config
├── package.json                # Root workspace config
├── tsconfig.base.json          # Shared TS config
└── README.md
```

---

## Step-by-Step Initialization

### 1. Create the monorepo root

```bash
mkdir notes-app && cd notes-app
bun init -y
```

Edit the root `package.json` to define workspaces:

```json
{
  "name": "notes-app",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "dev:api": "bun run --filter api dev",
    "dev:web": "bun run --filter web dev",
    "build": "bun run --filter '*' build",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "typecheck": "bun run --filter '*' typecheck"
  }
}
```

### 2. Shared TypeScript config

Create `tsconfig.base.json` at the root. Every sub-package extends this so compiler settings are consistent everywhere.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Then in each sub-package's `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### 3. Scaffold the API

```bash
mkdir -p apps/api/src/{routes,db,middleware,ai}
cd apps/api
bun init -y
bun add elysia @elysiajs/cors @elysiajs/cookie
bun add drizzle-orm postgres
bun add -d drizzle-kit @types/bun
```

`apps/api/package.json`:

```json
{
  "name": "api",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "start": "bun dist/index.js",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

`apps/api/src/index.ts`:

```ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .get("/ping", () => "pong")
  .listen(3000);

console.log(`API running at ${app.server?.url}`);
```

### 4. Scaffold the frontend

```bash
cd ../..
bun create vite apps/web --template react-ts
cd apps/web
bun add @tanstack/react-query
```

`apps/web/package.json` (edit the scripts):

```json
{
  "name": "web",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

### 5. Scaffold shared types

```bash
mkdir -p packages/shared/src
cd packages/shared
bun init -y
```

`packages/shared/package.json`:

```json
{
  "name": "@notes-app/shared",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

`packages/shared/src/index.ts`:

```ts
// Note types — the single source of truth
export interface Note {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}
```

Import from either app with `import { Note } from "@notes-app/shared"`.

### 6. Set up Biome (linter + formatter)

```bash
cd ../..  # back to root
bun add -d @biomejs/biome
```

`biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "files": {
    "ignore": ["node_modules", "dist", ".next", "drizzle"]
  }
}
```

---

## Git Workflow

### Branch strategy

Keep it simple — you're a solo developer, not a team of 20.

```
main              ← always deployable, auto-deploys to Railway
  └── dev         ← your working branch, merge to main when stable
       └── feat/notes-crud     ← short-lived feature branches off dev
       └── feat/auth
       └── feat/chat
```

Day-to-day workflow:

1. Create a feature branch off `dev`: `git checkout -b feat/notes-crud`
2. Work on it, commit often with clear messages
3. When done, merge into `dev`: `git checkout dev && git merge feat/notes-crud`
4. When `dev` is stable and tested, merge into `main`: triggers deploy
5. Delete the feature branch: `git branch -d feat/notes-crud`

### Commit messages

Use conventional commits — they're simple and make your git log readable:

```
feat: add notes CRUD routes
fix: handle empty note title on save
chore: update dependencies
docs: add API endpoint documentation
refactor: extract auth middleware
```

The prefix tells you what kind of change it is at a glance. This also sets you up for automated release notes later if you want them.

### .gitignore

```
node_modules/
dist/
.env
.env.local
*.db
drizzle/meta/
.DS_Store
```

---

## CI/CD Pipeline

Two GitHub Actions workflows: one for quality checks on every push, one for deploying on release.

### CI — runs on every push and pull request

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  check:
    name: Lint, Typecheck, Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Lint
        run: bun run lint

      - name: Typecheck
        run: bun run typecheck

      - name: Build
        run: bun run build
```

This catches broken code before it reaches `main`. If any step fails, the GitHub Actions tab shows a red X on that commit.

### Deploy — runs when you create a release

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    name: Deploy API to Railway
    runs-on: ubuntu-latest
    # Only deploy if CI passes
    needs: []

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy API
        run: railway up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-web:
    name: Deploy Frontend to Railway
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy Web
        run: railway up --service web
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

> **Note:** You'll need to add `RAILWAY_TOKEN` as a secret in your GitHub repo settings. Get it from Railway's dashboard under Account → Tokens.

### Alternative: let Railway auto-deploy

Railway can watch your `main` branch directly and deploy on every push — no GitHub Action needed. This is simpler to set up initially. You'd connect your repo in Railway's dashboard, point it at `main`, and it handles the rest. The GitHub Action approach gives you more control (e.g., only deploy if CI passes), but either works fine for a portfolio project. You can start with Railway's auto-deploy and switch to the Action later if you want tighter control.

---

## Releases & Versioning

For a portfolio project, keep this lightweight. You don't need a full semantic versioning pipeline — but tagging releases is valuable because it gives you snapshots you can reference and roll back to.

### Tagging by phase

Each time you finish a phase from the development plan, tag it:

```bash
git tag -a v0.1.0 -m "Phase 1: Notes CRUD"
git push origin v0.1.0
```

Suggested version mapping:

```
v0.1.0  — Phase 1: Notes CRUD
v0.2.0  — Phase 2: Authentication
v0.3.0  — Phase 3: AI Chat (basic)
v0.4.0  — Phase 4: Streaming
v0.5.0  — Phase 5: Note Relationships
v0.6.0  — Phase 6: Graph Visualization
v0.7.0  — Phase 7: AI Suggestions
v0.8.0  — Phase 8: Search & RAG
v1.0.0  — Feature-complete
```

### GitHub Releases

When you push a tag, go to your GitHub repo → Releases → "Draft a new release." Pick the tag, write a short summary of what's new, and publish. This creates a nice changelog on your repo page that anyone visiting can see — it shows the project is actively developed and well-organized.

You can automate this later with a tool like `changesets` or `release-it`, but doing it manually for 8 releases is perfectly fine.

---

## Dockerfile (API)

Railway needs a Dockerfile to build your API. This goes in `apps/api/Dockerfile`:

```dockerfile
FROM oven/bun:latest AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN cd apps/api && bun run build

# Production
FROM base AS production
COPY --from=build /app/apps/api/dist dist
COPY --from=build /app/node_modules node_modules

EXPOSE 3000
CMD ["bun", "dist/index.js"]
```

This is a multi-stage build — it keeps the final image small by only copying what's needed to run the app.

---

## Environment Variables

Create a `.env` file at the repo root (gitignored) for local development:

```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/notes_app

# Anthropic (add in Phase 3)
ANTHROPIC_API_KEY=sk-ant-...

# Auth (add in Phase 2)
SESSION_SECRET=some-random-string-here
```

In Railway, set these same variables in the service's Variables tab. Never commit `.env` to git.

---

## Local Development

### Starting everything

From the repo root:

```bash
# Terminal 1 — database (if using Docker)
docker run --name notes-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=notes_app -p 5432:5432 -d postgres:16

# Terminal 2 — API
bun run dev:api

# Terminal 3 — Frontend
bun run dev:web
```

Or use a single command if you set up the root `dev` script to run both apps concurrently.

### Verifying the setup

1. API health check: `curl http://localhost:3000/ping` → should return `pong`
2. Frontend: open `http://localhost:5173` → should load the React app
3. Frontend → API: add a fetch call to `/ping` in the React app and confirm it works

---

## Checklist

Before moving to Phase 1, confirm all of these:

- [ ] Monorepo structure created with workspaces
- [ ] API runs and responds to `GET /ping`
- [ ] Frontend runs and can fetch from the API
- [ ] Shared types package exists and is importable from both apps
- [ ] Biome linting passes with `bun run lint`
- [ ] TypeScript compiles with `bun run typecheck`
- [ ] Git repo initialized with `.gitignore`
- [ ] GitHub repo created with a Projects board
- [ ] CI workflow runs on push (even if there's nothing to deploy yet)
- [ ] `.env` file created locally, added to `.gitignore`
- [ ] README has a one-paragraph description of the project