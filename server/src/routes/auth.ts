import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { registerSchema, loginSchema } from '../lib/validation.js';
import { authRequired } from '../middleware/authRequired.js';

const router = Router();

const SALT_ROUNDS = 10;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function publicUser(u: {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  createdAt: Date;
}) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    bio: u.bio,
    createdAt: u.createdAt,
  };
}

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Невалидные данные', issues: parsed.error.issues });
  }

  const { email, username, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const field = existing.email === email ? 'email' : 'username';
    return res.status(409).json({ error: `Этот ${field} уже занят` });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  });

  const token = signToken({ userId: user.id });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Невалидные данные', issues: parsed.error.issues });
  }

  const { emailOrUsername, password } = parsed.data;

  const isEmail = emailOrUsername.includes('@');
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: emailOrUsername } : { username: emailOrUsername },
  });

  if (!user) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const token = signToken({ userId: user.id });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({ user: publicUser(user) });
});

router.get('/me', authRequired, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    res.clearCookie('token', COOKIE_OPTIONS);
    return res.status(401).json({ error: 'Пользователь не найден' });
  }
  res.json({ user: publicUser(user) });
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ ok: true });
});

export default router;
