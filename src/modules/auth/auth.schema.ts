import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(3).max(50),
  password: z.string().min(6).max(30),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
