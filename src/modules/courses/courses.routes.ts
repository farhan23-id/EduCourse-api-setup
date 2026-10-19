import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.middleware";
import { parseId } from "../../utils/parse-id";
import { prisma } from "../../lib/prisma";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { HttpError } from "../../middlewares/error.middleware";

const router = Router();

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
});
const updateSchema = createSchema.partial();

const include = { tutor: { select: { id: true, name: true } } };

// for public
router.get("/", async (_req, res) => {
  res.json(await prisma.course.findMany({ include }));
});

router.get("/:id", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: parseId(req.params.id) },
    include,
  });
  if (!course) throw new HttpError(404, "Course tidak ditemukan");
  res.status(201).json(course);
});

// butuh login admin/tutor
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "TUTOR"),
  validate(createSchema),
  async (req, res) => {
    const course = await prisma.course.create({
      data: { ...req.body, tutorId: req.user!.id },
      include,
    });
    res.status(201).json(course);
  },
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "TUTOR"),
  validate(updateSchema),
  async (req, res) => {
    const id = parseId(req.params.id);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new HttpError(404, "Course tidak ditemukan");
    if (req.user!.role !== "ADMIN" && course.tutorId !== req.user!.id)
      throw new HttpError(403, "Bukan course kamu");
    res.json(
      await prisma.course.update({ where: { id }, data: req.body, include }),
    );
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "TUTOR"),
  async (req, res) => {
    const id = parseId(req.params.id);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new HttpError(404, "Course tidak ditemukan");
    if (req.user!.role !== "ADMIN" && course.tutorId !== req.user!.id)
      throw new HttpError(403, "Bukan course kamu");

    await prisma.course.delete({ where: { id } });
    res.status(204).send();
  },
);

export default router;
