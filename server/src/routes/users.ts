import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/authRequired.js';
import { updateProfileSchema } from '../lib/validation.js';

const router = Router();

const publicProfileSelect = {
  id: true,
  username: true,
  bio: true,
  createdAt: true,
} as const;

router.get('/:username', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: publicProfileSelect,
  });
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  res.json({ user });
});

router.put('/me', authRequired, async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Невалидные данные', issues: parsed.error.issues });
  }
  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json({ error: 'Нечего обновлять' });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      createdAt: true,
    },
  });
  res.json({ user });
});

export default router;
