import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { HttpError } from "../../middlewares/error.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), async (req, res) => {
  const { email, name, password } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new HttpError(409, "Email sudah terdaftar");

  const user = await prisma.user.create({
    data: { email, name, password: await bcrypt.hash(password, 10) },
    select: { id: true, email: true, name: true, role: true },
  });
  res.status(201).json(user);
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, "Email atau password salah");
  }

  const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

  res.json({ token });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) throw new HttpError(404, "User tidak ditemukan");
  res.json({ user });
});

export default router;
