# FOCUS.bm — суперқосымша MVP

Казахстан нарығына арналған бірыңғай платформа: оқу, мессенджер, әлеуметтік желі, танысу. Интерфейс қазақ тілінде.

## Құрама бөліктер

- `docs/` — архитектура, қауіпсіздік, әкімші, UX, іске қосу
- `backend/` — Node.js + Express + Prisma (SQLite MVP) + Socket.IO
- `frontend/` — React + Vite + TypeScript

## Жергілікті іске қосу

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API: `http://localhost:4000` · денсаулық: `GET /health`

Әкімші (seed): `admin@focus.bm` / `AdminFOCUS2026!`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Веб: `http://localhost:5173` (прокси `/api` және WebSocket)

## API мысалдары

| Әдіс | Жол | Сипаттама |
|------|-----|-----------|
| POST | `/api/auth/register` | `{ email, password, displayName }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/courses` | Жарияланған курстар |
| POST | `/api/messaging/conversations/dm` | `{ peerUserId }` — JWT қажет |
| WS | `chat:send` | `{ conversationId, ciphertext }` — E2EE конверт |

Толығырақ: `docs/ARCHITECTURE.md`, `docs/SECURITY.md`.

## GitHub және уақытша хостинг (туториал)

- **Git + push:** [docs/GITHUB.md](docs/GITHUB.md)
- **GitHub vs сервер, Render, `VITE_API_URL`:** [docs/TUTORIAL_GITHUB_AND_HOSTING.md](docs/TUTORIAL_GITHUB_AND_HOSTING.md)

## Интернет арқылы басқа адамдарға (тест)

Қадам-кезең: **[docs/DEPLOY_REMOTE.md](docs/DEPLOY_REMOTE.md)** (Render: API + статикалық frontend, `CLIENT_ORIGIN`, `VITE_API_URL`). Қолайлы старт: репозиторийдегі [`render.yaml`](render.yaml).
