import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./lib/prisma.js";
import { verifyAccessToken } from "./lib/jwt.js";
import authRoutes from "./routes/auth.js";
import coursesRoutes from "./routes/courses.js";
import socialRoutes from "./routes/social.js";
import datingRoutes from "./routes/dating.js";
import messagingRoutes from "./routes/messaging.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

/** Бір немесе бірнеше origin: үтірмен бөлінген, мысалы https://app.onrender.com,http://localhost:5173 */
function parseOrigins(): string[] {
  const raw = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const allowedOrigins = parseOrigins();

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "FOCUS.bm API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/dating", datingRoutes);
app.use("/api/messaging", messagingRoutes);
app.use("/api/admin", adminRoutes);

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.use((socket, next) => {
  const token =
    (socket.handshake.auth as { token?: string }).token ??
    (typeof socket.handshake.headers.authorization === "string" &&
    socket.handshake.headers.authorization.startsWith("Bearer ")
      ? socket.handshake.headers.authorization.slice(7)
      : undefined);
  if (!token) {
    next(new Error("Токен жоқ"));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("Токен жарамсыз"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  socket.join(`user:${userId}`);

  socket.on(
    "chat:send",
    async (payload: { conversationId: string; ciphertext: string; contentType?: string }, ack?: (r: unknown) => void) => {
      try {
        const member = await prisma.conversationMember.findFirst({
          where: { conversationId: payload.conversationId, userId },
        });
        if (!member) {
          ack?.({ error: "Қатысу жоқ" });
          return;
        }
        const msg = await prisma.message.create({
          data: {
            conversationId: payload.conversationId,
            senderId: userId,
            ciphertext: payload.ciphertext,
            contentType: payload.contentType ?? "text",
          },
        });
        const members = await prisma.conversationMember.findMany({
          where: { conversationId: payload.conversationId },
        });
        for (const m of members) {
          io.to(`user:${m.userId}`).emit("chat:message", {
            conversationId: payload.conversationId,
            message: msg,
          });
        }
        ack?.({ ok: true, message: msg });
      } catch (e) {
        ack?.({ error: "Сервер қатесі" });
      }
    },
  );
});

server.listen(port, "0.0.0.0", () => {
  console.log(`FOCUS.bm API порт ${port}, CORS: ${allowedOrigins.join(", ")}`);
});
