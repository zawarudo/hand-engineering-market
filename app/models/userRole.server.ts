import { UserRole } from "@prisma/client";
import { prisma } from "~/db.server";
import { Role } from "./role.server";
import { User } from "./user.server";

export type { UserRole } from "@prisma/client";

export async function getUserRolesByUserId(id: User["id"]) {
  return prisma.userRole.findMany({ where: { userId: id } });
}

export async function getUserRoleByRoleId(id: Role["id"]) {
  return prisma.userRole.findUnique({ where: { roleId: id } });
}

export async function getUserRoleById(id: UserRole["id"]) {
  return prisma.userRole.findUnique({ where: { id: id } });
}