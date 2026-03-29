import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: { author: { select: { displayName: true } }, lessons: { orderBy: { sortOrder: "asc" } } },
  });
  res.json(courses);
});

router.get("/mine/list", authMiddleware, async (req: AuthedRequest, res) => {
  const rows = await prisma.enrollment.findMany({
    where: { userId: req.user!.id },
    include: { course: { include: { lessons: true } } },
  });
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const course = await prisma.course.findFirst({
    where: { id: req.params.id, published: true },
    include: { lessons: { orderBy: { sortOrder: "asc" } }, author: { select: { displayName: true } } },
  });
  if (!course) {
    res.status(404).json({ error: "Курс табылмады" });
    return;
  }
  res.json(course);
});

const enrollSchema = z.object({ courseId: z.string() });

router.post("/enroll", authMiddleware, async (req: AuthedRequest, res) => {
  const parsed = enrollSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const { courseId } = parsed.data;
  const course = await prisma.course.findFirst({ where: { id: courseId, published: true } });
  if (!course) {
    res.status(404).json({ error: "Курс жоқ" });
    return;
  }
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: req.user!.id, courseId } },
    create: { userId: req.user!.id, courseId, progress: 0 },
    update: {},
  });
  res.json({ ok: true });
});

const progressSchema = z.object({ courseId: z.string(), progress: z.number().min(0).max(100) });

router.patch("/progress", authMiddleware, async (req: AuthedRequest, res) => {
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Қате" });
    return;
  }
  const { courseId, progress } = parsed.data;
  await prisma.enrollment.updateMany({
    where: { userId: req.user!.id, courseId },
    data: { progress },
  });
  res.json({ ok: true });
});

export default router;
