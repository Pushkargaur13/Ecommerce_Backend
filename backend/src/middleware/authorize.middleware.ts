import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function authorize(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user || !user.sub) return res.status(401).json({ error: 'Unauthorized' });

      const rolesFromToken: string[] | undefined = user.roles;

      if (!rolesFromToken) {
        return res.status(403).json({ error: 'Forbidden: roles not present in token' });
      }

      const has = rolesFromToken.some((r) => allowedRoles.includes(r));
      if (!has) return res.status(403).json({ error: 'Forbidden' });

      next();
    } catch (err) {
      console.error('authorize error', err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
}
