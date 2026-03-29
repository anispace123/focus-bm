# Басқа адамдар үшін қолжетімді ету (интернет арқылы)

Жергілікті `localhost` емес — **бұлтта** орналастырғанда әркім браузерден кіре алады. Төмендегі нұсқа **Render.com** (тегін тариф, GitHub байланысы) — сіз басқа провайдерді (Railway, Fly.io) де сол логикамен қолдана аласыз.

## Не қажет

| Қабат | Не істейді |
|-------|------------|
| **Backend** | Node.js API + WebSocket (HTTPS) |
| **Frontend** | Vite build → статикалық HTML/JS |
| **Орта айнымалылар** | `JWT_SECRET`, `DATABASE_URL`, `CLIENT_ORIGIN`, `VITE_API_URL` |

**Ескерту:** тегін Render instance **ұйықтауы** мүмкін (бірінші сұрау 30–60 с секунд). SQLite дерегі тегін дискіде **қайта іске қосқанда** жоғалуы мүмкін — тек тест үшін; тұрақты үшін кейін **PostgreSQL** қосыңыз.

---

## Қадам 1. Код GitHub-та

Репозиторийде `FOCUS.bm` болуы керек (жоғарыдан `git push`). Туториал: [TUTORIAL_GITHUB_AND_HOSTING.md](./TUTORIAL_GITHUB_AND_HOSTING.md).

---

## Қадам 2. Backend (API) — Render Web Service

1. [render.com](https://render.com) → GitHub арқылы кіру.
2. **New +** → **Web Service**.
3. Репозиторийді таңдаңыз.
4. Баптаулар:

| Өріс | Мәні |
|------|------|
| **Name** | мысалы `focus-bm-api` |
| **Region** | өзіңізге жақын (Frankfurt т.б.) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma db push && npm run build` |
| **Start Command** | `node dist/index.js` |
| **Instance type** | Free |

5. **Environment** (Add Environment Variable):

| Key | Мәні |
|-----|------|
| `NODE_VERSION` | `20` (немесе `22`) |
| `DATABASE_URL` | `file:./prod.db` |
| `JWT_SECRET` | ұзын кездейсоқ жол (мысалы 32+ таңба) |
| `CLIENT_ORIGIN` | **алдымен бос қалдырыңыз немесе уақытша** `http://localhost:5173` — **frontend URL шыққан соң** жаңартып, үтірмен қосасыз (төменде) |

6. **Create Web Service** — build біткенше күтіңіз.
7. Жоғарыда **URL** шығады, мысалы: `https://focus-bm-api.onrender.com`

**Тексеру:** браузерде ашыңыз:

```text
https://СІЗДІҢ-API.onrender.com/health
```

`{"status":"ok",...}` болуы керек.

---

## Қадам 3. Frontend — Render Static Site (немесе Vercel)

### Render Static Site

1. **New +** → **Static Site**.
2. Сол GitHub репозиторий.
3. Баптаулар:

| Өріс | Мәні |
|------|------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish directory** | `dist` |

4. **Environment** → **Add**:

| Key | Мәні |
|-----|------|
| `VITE_API_URL` | `https://СІЗДІҢ-API.onrender.com` (соңғы `/` **жоқ**) |

5. **Create Static Site** — build соңында **URL** шығады, мысалы `https://focus-bm-web.onrender.com`

### CORS қайта баптау

Backend **Environment** ішінде `CLIENT_ORIGIN` мәнін **frontend** нақты URL-іне қойыңыз. Бірнеше домен болса **үтірмен**:

```text
https://focus-bm-web.onrender.com,http://localhost:5173
```

Содан кейін API сервисінде **Manual Deploy → Clear build cache & deploy** немесе қайта іске қосу.

---

## Қадам 4. Бірінші әкімші / дерек

Тегін SQLite қайта құрылғанда **бос** болуы мүмкін. Әкімші құру үшін Render **Shell** немесе бір реттік **Deploy hook** арқылы:

- **Shell** (Web Service → Shell):  
  `cd backend` емес — root `backend` болса, жұмыс қалтасы жоба түбі болуы мүмкін; Render Shell-де:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Егер `tsx` жоқ болса, `npm install` барысында devDependencies орнатылғанын тексеріңіз немесе `package.json`-ға seed үшін `node --import tsx` т.б. қосыңыз.

Оңай жол: жергілікті `.env` сияқты `DATABASE_URL` бірдей емес — **бұлттағы** файлға seed тек Shell арқылы.

**Қарапайым нұсқа:** тіркелу экранынан жаңа аккаунт ашып пайдаланыңыз; әкімшілік үшін DB-да қолмен `role` өзгерту керек болады — MVP үшін жеткілікті.

---

## Қадам 5. Басқа адамға сілтеме

Оларға тек **frontend URL** жіберіңіз:

```text
https://СІЗДІҢ-STATIC.onrender.com
```

Олар тіркеліп кіреді — API мен WebSocket `VITE_API_URL` арқылы сіздің бэкендке барады.

---

## Тексеру тізімі

- [ ] `/health` API доменінде жұмыс істейді.
- [ ] Статикалық сайт ашылады, тіркелу/кіру өтеді.
- [ ] `CLIENT_ORIGIN` дәл frontend HTTPS адресі (үтірмен localhost қосуға болады).
- [ ] Чат: екі әртүрлі браузерде екі аккаунт — хабарлама келеді (WebSocket).

---

## Мәселелер

| Белгі | Шешім |
|-------|--------|
| CORS қатесі | `CLIENT_ORIGIN` frontend URL-імен сәйкес емес — түзетіңіз, API қайта deploy. |
| API 502 | Build/Start командалары, `PORT` — Render автомат береді; `listen(0.0.0.0)` қолданылады. |
| Чат қосылмайды | `VITE_API_URL` дұрыс, `wss` — HTTPS сайттан Socket.IO сол доменге барады. |
| Дерек жоғалды | Тегін SQLite қайта іске қосу — **PostgreSQL** қосыңыз. |

---

## Файл: `render.yaml` (қалау бойынша)

Репозиторий түбінде [`render.yaml`](../render.yaml) бар — Render Dashboard → **New** → **Blueprint** → репозиторийді таңдаңыз.  
Екі сервис құрылады; **алғашқы сәтте** `VITE_API_URL` мен `CLIENT_ORIGIN` бос болуы мүмкін — API мен static URL шыққаннан кейін Environment ішінде толтырып **қайта deploy** жасаңыз.  
Алғашқы рет **қолмен** қадамдармен (жоғарыдағы 2–3 бөлім) жүру оңайырақ болуы мүмкін.
