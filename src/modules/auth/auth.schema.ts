import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(50),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^\w+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.email().toLowerCase(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
