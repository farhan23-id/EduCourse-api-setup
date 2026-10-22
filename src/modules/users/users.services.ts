import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middlewares/error.middleware";
import { UpdateUserInput } from "./users.schema";
import { publicUserSelect } from "./user.select";

type Requester = { id: number; role: Role };

const assertSelfOrAdmin = (requester: Requester, targetId: number) => {
  if (requester.role !== "ADMIN" && requester.id !== targetId)
    throw new HttpError(403, "Akses ditolak");
};

export const listUsers = () =>
  prisma.user.findMany({ select: publicUserSelect, orderBy: { id: "asc" } });

export const getUserById = async (id: number, requester: Requester) => {
  assertSelfOrAdmin(requester, id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
  if (!user) throw new HttpError(404, "User tidak ditemukan");
  return user;
};

export const updateUser = async (
  id: number,
  input: UpdateUserInput,
  requester: Requester,
) => {
  assertSelfOrAdmin(requester, id);

  // Limit akses untuk non-admin
  const { role, isActive, ...profile } = input;
  const data = requester.role === "ADMIN" ? input : profile;

  return prisma.user.update({ where: { id }, data, select: publicUserSelect });
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({ where: { id } });
};
