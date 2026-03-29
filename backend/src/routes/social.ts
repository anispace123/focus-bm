import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/feed", async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, displayName: true } },
      likes: { select: { userId: true } },
    },
  });
  res.json(posts);
});

const postSchema = z.object({ content: z.string().min(1).max(2000) });

router.post("/posts", authMiddleware, async (req: AuthedRequest, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Мәтін қысқа немесе ұзын" });
    return;
  }
  const post = await prisma.post.create({
    data: { userId: req.user!.id, content: parsed.data.content },
    include: { user: { select: { displayName: true } }, likes: true },
  });
  res.json(post);
});

router.post("/posts/:id/like", authMiddleware, async (req: AuthedRequest, res) => {
  const postId = req.params.id;
  try {
    await prisma.like.create({
      data: { userId: req.user!.id, postId },
    });
  } catch {
    // already liked
  }
  const count = await prisma.like.count({ where: { postId } });
  res.json({ likes: count });
});

export default router;
