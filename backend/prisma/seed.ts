import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@focus.bm";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "AdminFOCUS2026!";
  const hash = await argon2.hash(password);
  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash: hash,
      displayName: "Әкімші",
      role: "ADMIN",
    },
    update: { role: "ADMIN", passwordHash: hash },
  });

  const existing = await prisma.course.findFirst({ where: { id: "seed-course-1" } });
  if (!existing) {
    await prisma.course.create({
      data: {
        id: "seed-course-1",
        title: "Веб әзірлеу негіздері",
        description: "HTML, CSS, JavaScript кіріспе.",
        published: true,
        authorId: admin.id,
        lessons: {
          create: [
            { title: "Кіріспе", sortOrder: 0, videoUrl: "https://example.com/video1.mp4" },
            { title: "DOM", sortOrder: 1, videoUrl: "" },
          ],
        },
      },
    });
  }
  console.log("Seed OK. Әкімші:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
