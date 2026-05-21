import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/authRequired.js';
import { createPageSchema, updatePageSchema } from '../lib/validation.js';
import { slugify } from '../lib/slugify.js';

const router = Router();

const authorSelect = {
  id: true,
  username: true,
} as const;

router.get('/', async (_req: Request, res: Response) => {
  const pages = await prisma.wikiPage.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      author: { select: authorSelect },
    },
  });
  res.json({ pages });
});

router.get('/by-user/:username', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: { id: true },
  });
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  const pages = await prisma.wikiPage.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      author: { select: authorSelect },
    },
  });
  res.json({ pages });
});

router.get('/:slug', async (req: Request, res: Response) => {
  const page = await prisma.wikiPage.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: authorSelect } },
  });
  if (!page) {
    return res.status(404).json({ error: 'Страница не найдена' });
  }
  res.json({ page });
});

router.post('/', authRequired, async (req: Request, res: Response) => {
  const parsed = createPageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Невалидные данные', issues: parsed.error.issues });
  }
  const { title, content } = parsed.data;

  const slug = slugify(title);
  if (!slug) {
    return res.status(400).json({ error: 'Заголовок должен содержать буквы или цифры' });
  }

  const taken = await prisma.wikiPage.findUnique({ where: { slug }, select: { id: true } });
  if (taken) {
    return res.status(409).json({ error: 'Страница с таким заголовком уже существует' });
  }

  const page = await prisma.wikiPage.create({
    data: {
      slug,
      title,
      content,
      authorId: req.user!.id,
    },
    include: { author: { select: authorSelect } },
  });

  res.status(201).json({ page });
});

router.put('/:slug', authRequired, async (req: Request, res: Response) => {
  const parsed = updatePageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Невалидные данные', issues: parsed.error.issues });
  }
  if (parsed.data.title === undefined && parsed.data.content === undefined) {
    return res.status(400).json({ error: 'Нечего обновлять' });
  }

  const existing = await prisma.wikiPage.findUnique({
    where: { slug: req.params.slug },
    select: { id: true },
  });
  if (!existing) return res.status(404).json({ error: 'Страница не найдена' });

  const page = await prisma.wikiPage.update({
    where: { id: existing.id },
    data: parsed.data,
    include: { author: { select: authorSelect } },
  });
  res.json({ page });
});

router.delete('/:slug', authRequired, async (req: Request, res: Response) => {
  const page = await prisma.wikiPage.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, authorId: true },
  });
  if (!page) {
    return res.status(404).json({ error: 'Страница не найдена' });
  }
  if (page.authorId !== req.user!.id) {
    return res.status(403).json({ error: 'Удалять страницу может только автор' });
  }

  await prisma.wikiPage.delete({ where: { id: page.id } });
  res.json({ ok: true });
});

export default router;
