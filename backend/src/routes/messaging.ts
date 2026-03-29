import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/conversations", authMiddleware, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const members = await prisma.conversationMember.findMany({
    where: { userId: uid },
    include: {
      conversation: {
        include: {
          members: { include: { user: { select: { id: true, displayName: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });
  res.json(members.map((m) => m.conversation));
});

const createDmSchema = z.object({ peerUserId: z.string() });

router.post("/conversations/dm", authMiddleware, async (req: AuthedRequest, res) => {
  const parsed = createDmSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const { peerUserId } = parsed.data;
  const me = req.user!.id;
  if (peerUserId === me) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const candidates = await prisma.conversation.findMany({
    where: { isGroup: false, members: { some: { userId: me } } },
    include: { members: true },
  });
  const existing = candidates.find(
    (c) => c.members.length === 2 && c.members.some((m) => m.userId === peerUserId),
  );
  if (existing) {
    res.json(existing);
    return;
  }
  const conv = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [{ userId: me }, { userId: peerUserId }],
      },
    },
  });
  res.json(conv);
});

const sendSchema = z.object({
  conversationId: z.string(),
  /// Клиент E2EE шифрлаған base64 — сервер оқымайды
  ciphertext: z.string().min(1),
  contentType: z.string().optional(),
});

router.post("/messages", authMiddleware, async (req: AuthedRequest, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const { conversationId, ciphertext, contentType } = parsed.data;
  const member = await prisma.conversationMember.findFirst({
    where: { conversationId, userId: req.user!.id },
  });
  if (!member) {
    res.status(403).json({ error: "Қатысу жоқ" });
    return;
  }
  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.user!.id,
      ciphertext,
      contentType: contentType ?? "text",
    },
  });
  res.json(msg);
});

router.get("/conversations/:id/messages", authMiddleware, async (req: AuthedRequest, res) => {
  const member = await prisma.conversationMember.findFirst({
    where: { conversationId: req.params.id, userId: req.user!.id },
  });
  if (!member) {
    res.status(403).json({ error: "Тыйым" });
    return;
  }
  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  res.json(messages);
});

export default router;
