# FOCUS.bm — REST API мысалдары

База URL: `http://localhost:4000`

## Аутентификация

**Тіркелу** `POST /api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "minimum8chars",
  "displayName": "Айгүл"
}
```

**Жауап:** `{ "token": "...", "user": { "id", "email", "displayName", "role" } }`

**Кіру** `POST /api/auth/login` — денесі сияқты, `password` ғана.

**Профиль** `GET /api/auth/me` — бастық: `Authorization: Bearer <token>`

## Оқу

- `GET /api/courses` — жарияланған курстар
- `GET /api/courses/:id` — бөлшек
- `POST /api/courses/enroll` — `{ "courseId" }` (JWT)
- `PATCH /api/courses/progress` — `{ "courseId", "progress": 0-100 }` (JWT)
- `GET /api/courses/mine/list` — менің жазбаларым (JWT)

## Әлеуметтік желі

- `GET /api/social/feed`
- `POST /api/social/posts` — `{ "content" }` (JWT)
- `POST /api/social/posts/:id/like` (JWT)

## Танысу

- `GET /api/dating/suggestions` (JWT)
- `POST /api/dating/match` — `{ "targetUserId" }` (JWT)

## Хабарламалар (E2EE конверт)

- `GET /api/messaging/conversations` (JWT)
- `POST /api/messaging/conversations/dm` — `{ "peerUserId" }` (JWT)
- `POST /api/messaging/messages` — `{ "conversationId", "ciphertext", "contentType?" }` (JWT)
- `GET /api/messaging/conversations/:id/messages` (JWT)

## WebSocket (Socket.IO)

Қосылу: клиент `auth: { token: "<JWT>" }` жібереді.

Оқиға `chat:send`:

```json
{
  "conversationId": "…",
  "ciphertext": "base64…",
  "contentType": "text"
}
```

Сервер `chat:message` оқиғасын мүшелерге таратады.

## Әкімші (рөл ADMIN)

- `GET /api/admin/stats`
- `GET /api/admin/users?q=`
- `PATCH /api/admin/users/:id` — `{ "blocked": true }` немесе `{ "role": "ADMIN" }`
- `GET /api/admin/courses`
- `POST /api/admin/courses` — `{ "title", "description", "published": true }`
