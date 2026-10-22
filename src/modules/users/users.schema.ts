import { z } from "zod";

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  phoneNumber: z.string().trim().min(6).max(20).optional(),
  avatarUrl: z.url().optional(),

  // Khusus admin
  role: z.enum(["ADMIN", "STUDENT"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
