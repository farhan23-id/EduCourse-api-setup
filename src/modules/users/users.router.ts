import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { HttpError } from "../../middlewares/error.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { parseId } from "../../utils/parse-id";

const router = Router();
const safeSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN", "TUTOR", "STUDENT"]).optional(),
});

router.use(authenticate);

router.get("/", authorize("ADMIN"), async (_req, res) => {
  res.json(await prisma.user.findMany({ select: safeSelect }));
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (req.user!.role !== "ADMIN" && req.user!.id !== id)
    throw new HttpError(403, "Akses ditolak");

  const user = await prisma.user.findUnique({
    where: { id },
    select: safeSelect,
  });
  if (!user) throw new HttpError(404, "User tidak ditemukan");
  res.json(user);
});

router.patch("/:id", validate(updateSchema), async (req, res) => {
  const id = parseId(req.params.id);
  const isAdmin = req.user!.role === "ADMIN";
  if (!isAdmin && req.user!.id !== id)
    throw new HttpError(403, "Akses ditolak");
  if (!isAdmin) delete req.body.role;

  const user = await prisma.user.update({
    where: { id },
    data: req.body,
    select: safeSelect,
  });
  res.json(user);
});

router.delete("/:id", authorize("ADMIN"), async (req, res) => {
  await prisma.user.delete({ where: { id: parseId(req.params.id) } });
  res.status(204).send();
});

export default router;
