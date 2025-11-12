import { Request, Response } from 'express';
import prisma from '../prisma/client';
import * as roleService from '../services/role.service';

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const withRoles = await Promise.all(users.map(async (u) => {
    const roles = await roleService.getUserRoles(u.id);
    return { ...u, roles };
  }));
  res.json({ users: withRoles });
}

export async function assignRole(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });

    await roleService.assignRoleToUser(userId, role);
    const roles = await roleService.getUserRoles(userId);
    res.json({ ok: true, roles });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function removeRole(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });

    await roleService.removeRoleFromUser(userId, role);
    const roles = await roleService.getUserRoles(userId);
    res.json({ ok: true, roles });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
