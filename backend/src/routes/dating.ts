import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/suggestions", authMiddleware, async (req: AuthedRequest, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!me) {
    res.status(404).json({ error: "Жоқ" });
    return;
  }
  const others = await prisma.user.findMany({
    where: {
      id: { not: me.id },
      blocked: false,
      ...(me.city ? { city: me.city } : {}),
    },
    take: 20,
    select: { id: true, displayName: true, bio: true, city: true, createdAt: true },
  });
  const withScore = others.map((u) => ({
    ...u,
    score: Math.random(),
  }));
  withScore.sort((a, b) => b.score - a.score);
  res.json(withScore);
});

const matchSchema = z.object({ targetUserId: z.string() });

router.post("/match", authMiddleware, async (req: AuthedRequest, res) => {
  const parsed = matchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const { targetUserId } = parsed.data;
  if (targetUserId === req.user!.id) {
    res.status(400).json({ error: "Өзіңізді таңдамаңыз" });
    return;
  }
  const [a, b] = [req.user!.id, targetUserId].sort();
  const m = await prisma.match.upsert({
    where: { userAId_userBId: { userAId: a, userBId: b } },
    create: { userAId: a, userBId: b, score: Math.random(), status: "active" },
    update: { status: "active" },
  });
  res.json(m);
});

router.get("/matches", authMiddleware, async (req: AuthedRequest, res) => {
  const uid = req.user!.id;
  const list = await prisma.match.findMany({
    where: { OR: [{ userAId: uid }, { userBId: uid }] },
  });
  res.json(list);
});

export default router;
