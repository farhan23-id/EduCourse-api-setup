import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middlewares/error.middleware";
import { publicUserSelect } from "../users/user.select";
import { LoginInput, RegisterInput } from "./auth.schema";

export const registerUser = async (input: RegisterInput) => {
  const duplicate = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { email: true },
  });
  if (duplicate) {
    throw new HttpError(
      409,
      duplicate.email === input.email
        ? "Email sudah terdaftar"
        : "Username sudah dipakai",
    );
  }

  return prisma.user.create({
    data: {
      fullName: input.fullName,
      username: input.username,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
    },
    select: publicUserSelect,
  });
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new HttpError(401, "Email atau password salah");
  }

  if (!user.isActive) throw new HttpError(401, "User dinonaktifkan");

  const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
  return { token };
};

export const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
  if (!user) throw new HttpError(404, "User tidak ditemukan");
  return user;
};
