import bcrypt from "bcryptjs";
import { Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const findOrCreateTutor = async (data: Prisma.TutorCreateInput) =>
  (await prisma.tutor.findFirst({ where: { name: data.name } })) ??
  prisma.tutor.create({ data });

async function main() {
  // admin untuk testing: admin@educourse.test / admin123
  await prisma.user.upsert({
    where: { email: "admin@educourse.test" },
    update: {},
    create: {
      username: "admin",
      email: "admin@educourse.test",
      fullName: "Admin Educourse",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const web = await prisma.category.upsert({
    where: { slug: "web-development" },
    update: {},
    create: { name: "Web Development", slug: "web-development" },
  });
  const data = await prisma.category.upsert({
    where: { slug: "data-science" },
    update: {},
    create: { name: "Data Science", slug: "data-science" },
  });

  const budi = await findOrCreateTutor({
    name: "Budi Santoso",
    company: "Tokopedia",
    mainJob: "Senior Backend Engineer",
  });
  const sari = await findOrCreateTutor({
    name: "Sari Dewi",
    company: "Gojek",
    mainJob: "Data Scientist",
  });

  await prisma.course.createMany({
    skipDuplicates: true, // aman dijalankan berulang karena slug unik
    data: [
      {
        title: "Dasar HTML dan CSS",
        slug: "dasar-html-css",
        price: 0,
        status: "PUBLISHED",
        categoryId: web.id,
        tutorId: budi.id,
      },
      {
        title: "JavaScript Modern",
        slug: "javascript-modern",
        price: 150000,
        status: "PUBLISHED",
        categoryId: web.id,
        tutorId: budi.id,
      },
      {
        title: "REST API dengan Express",
        slug: "rest-api-express",
        price: 250000,
        status: "PUBLISHED",
        categoryId: web.id,
        tutorId: budi.id,
      },
      {
        title: "Python untuk Data Science",
        slug: "python-data-science",
        price: 200000,
        status: "PUBLISHED",
        categoryId: data.id,
        tutorId: sari.id,
      },
      {
        title: "Machine Learning Pemula",
        slug: "machine-learning-pemula",
        price: 350000,
        status: "PUBLISHED",
        categoryId: data.id,
        tutorId: sari.id,
      },
      {
        title: "Deep Learning (Draft)",
        slug: "deep-learning",
        price: 500000,
        status: "DRAFT",
        categoryId: data.id,
        tutorId: sari.id,
      },
    ],
  });

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
