import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middlewares/error.middleware";
import { publicUserSelect } from "../users/user.select";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "./auth.mail";
import { LoginInput, RegisterInput } from "./auth.schema";

// token verifikasi berlaku 24 jam
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

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

  const token = uuidv4();

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      username: input.username,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      verificationToken: token,
      verificationTokenExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
    },
    select: publicUserSelect,
  });

  // kegagalan SMTP tidak boleh membatalkan registrasi (user sudah tersimpan di database)
  let emailSent = true;
  try {
    await sendVerificationEmail(user.email, user.fullName, token);
  } catch (error) {
    emailSent = false;
    console.error("Gagal mengirim email verifikasi:", error);
  }

  return { user, emailSent };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new HttpError(401, "Email atau password salah");
  }
  if (!user.isActive) throw new HttpError(403, "Akun dinonaktifkan");

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

export const verifyUserEmail = async (token: string) => {
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (
    !user?.verificationTokenExpiresAt ||
    user.verificationTokenExpiresAt < new Date()
  ) {
    throw new HttpError(400, "Invalid Verification Token");
  }

  // token dihapus setelah dipakai, jadi hanya berlaku satu kali
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });
};
