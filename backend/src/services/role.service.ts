import prisma from '../prisma/client';

export async function getAllRoles() {
  return prisma.role.findMany();
}

export async function getUserRoles(userId: string) {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  return rows.map((r) => r.role.name);
}

export async function assignRoleToUser(userId: string, roleName: string) {
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { name: roleName } });
  }
  const existing = await prisma.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId: role.id },
    },
  });
  if (existing) return existing;

  return prisma.userRole.create({
    data: { userId, roleId: role.id },
  });
}

export async function removeRoleFromUser(userId: string, roleName: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return null;
  return prisma.userRole.deleteMany({ where: { userId, roleId: role.id } });
}
