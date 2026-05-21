import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middleware/authRequired.js';
import { createCommentSchema } from '../lib/validation.js';

const router = Router();

const authorSelect = {
  id: true,
  username: true,
} as const;

router.get('/pages/:slug/comments', async (req: Request, res: Response) => {
  const page = await prisma.wikiPage.findUnique({
    where: { slug: req.params.slug },
    select: { id: true },
  });
  if (!page) {
    return res.status(404).json({ error: 'Страница не найдена' });
  }

  const comments = await prisma.comment.findMany({
    where: { pageId: page.id },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: authorSelect } },
  });
  res.json({ comments });
});

router.post('/pages/:slug/comments', authRequired, async (req: Request, res: Response) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Невалидные данные', issues: parsed.error.issues });
  }

  const page = await prisma.wikiPage.findUnique({
    where: { slug: req.params.slug },
    select: { id: true },
  });
  if (!page) {
    return res.status(404).json({ error: 'Страница не найдена' });
  }

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parentId },
      select: { pageId: true },
    });
    if (!parent || parent.pageId !== page.id) {
      return res.status(400).json({ error: 'Невалидный parentId' });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      pageId: page.id,
      parentId: parsed.data.parentId ?? null,
      authorId: req.user!.id,
    },
    include: { author: { select: authorSelect } },
  });
  res.status(201).json({ comment });
});

router.delete('/comments/:id', authRequired, async (req: Request, res: Response) => {
  const existing = await prisma.comment.findUnique({
    where: { id: req.params.id },
    select: { authorId: true },
  });
  if (!existing) return res.status(404).json({ error: 'Комментарий не найден' });
  if (existing.authorId !== req.user!.id) {
    return res.status(403).json({ error: 'Можно удалять только свои комментарии' });
  }

  await prisma.comment.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
