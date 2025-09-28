# Nimbus Drive – Cloud File Manager

A full-stack document management platform featuring a Nuxt 3 + Tailwind CSS client and a NestJS API with PostgreSQL,
Prisma, AWS S3 (or MinIO) storage, and optional OpenAI-powered summaries.

## Project structure

```
.
├── backend   # NestJS API (JWT auth, Prisma, S3 integration)
└── frontend  # Nuxt 3 web application (Tailwind, Pinia, Axios)
```

## Getting started

### Prerequisites

- Node.js 18+
- pnpm / npm / yarn (choose your package manager)
- PostgreSQL database
- AWS S3 bucket or MinIO instance for object storage

### Environment variables

Copy each `.env.example` file and adjust values to match your environment.

```bash
cp backend/.env.example backend/.env
```

Required backend variables:

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN` – authentication settings
- `S3_*` – credentials + endpoint (set `S3_FORCE_PATH_STYLE=true` for MinIO)
- `OPENAI_API_KEY` – optional, enables `/files/:id/ai-summarize`
- `FRONTEND_URL` – CORS origin (defaults to `http://localhost:3000`)

### Database & Prisma

Generate the Prisma client and apply migrations:

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
```

### Running the API

```bash
pnpm start:dev
```

The server exposes REST endpoints under `http://localhost:4000/api`.

### Running the frontend

```bash
cd ../frontend
pnpm install
pnpm dev
```

The Nuxt app communicates with the API via `NUXT_PUBLIC_API_BASE` (defaults to `http://localhost:4000/api`).

## S3 / MinIO setup

1. Create a bucket for file storage (e.g. `nimbus-drive`).
2. Provide credentials via the environment variables listed above.
3. For MinIO:
   - Set `S3_ENDPOINT=http://localhost:9000`
   - Use `S3_FORCE_PATH_STYLE=true`

## Feature highlights

- JWT authentication (`/auth/register`, `/auth/login`)
- File CRUD, sharing, version history, breadcrumbs, and audit log
- Drag & drop uploads with progress indicators
- Search by name or tags via `/search?q=`
- Optional AI summarization endpoint `/files/:id/ai-summarize`
- Responsive dashboard UI with Tailwind CSS

## Scripts

| Location | Command | Description |
| --- | --- | --- |
| backend | `pnpm start:dev` | Start NestJS API with watch mode |
| backend | `pnpm prisma:migrate` | Apply database migrations |
| frontend | `pnpm dev` | Launch Nuxt development server |
| frontend | `pnpm build` | Create production build |

## Notes

- Replace `pnpm` with `npm run`/`yarn` if desired.
- The upload service stores binaries in S3 while keeping metadata + versions in PostgreSQL.
- AI summarization gracefully degrades if `OPENAI_API_KEY` is not provided.
