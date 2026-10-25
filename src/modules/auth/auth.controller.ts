import { Request, Response } from "express";
import { verifyEmailQuerySchema } from "./auth.schema";
import {
  getProfile,
  loginUser,
  registerUser,
  verifyUserEmail,
} from "./auth.service";

export const register = async (req: Request, res: Response) => {
  const { user, emailSent } = await registerUser(req.body);
  res.status(201).json({
    message: emailSent
      ? "Registrasi berhasil. Silakan cek email untuk verifikasi akun."
      : "Registrasi berhasil, tetapi email verifikasi gagal dikirim.",
    user,
  });
};

export const login = async (req: Request, res: Response) => {
  res.json(await loginUser(req.body));
};

export const me = async (req: Request, res: Response) => {
  res.json(await getProfile(req.user!.id));
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = verifyEmailQuerySchema.parse(req.query);
  await verifyUserEmail(token);
  res.json({ message: "Email Verified Successfully" });
};
