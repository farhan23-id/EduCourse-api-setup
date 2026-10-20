import { Prisma } from "../../generated/prisma/client";

export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phoneNumber: true,
  avatarUrl: true,
  role: true,
  isActive: true,
} satisfies Prisma.UserSelect;
