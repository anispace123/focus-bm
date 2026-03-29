import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware, requireAdmin);

router.get("/stats", async (_req, res) => {
  const [users, courses, posts, messages] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.post.count(),
    prisma.message.count(),
  ]);
  res.json({ users, courses, posts, messages });
});

router.get("/users", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { displayName: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      blocked: true,
      createdAt: true,
    },
  });
  res.json(users);
});

const patchUserSchema = z.object({
  blocked: z.boolean().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

router.patch("/users/:id", async (req, res) => {
  const parsed = patchUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: parsed.data,
    select: { id: true, email: true, displayName: true, role: true, blocked: true },
  });
  res.json(user);
});

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  published: z.boolean().optional(),
});

router.post("/courses", async (req: AuthedRequest, res) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      published: parsed.data.published ?? true,
      authorId: req.user!.id,
    },
  });
  res.json(course);
});

router.get("/courses", async (_req, res) => {
  const courses = await prisma.course.findMany({
    include: { author: { select: { displayName: true } }, lessons: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(courses);
});

export default router;
