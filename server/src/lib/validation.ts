import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Невалидный email'),
  username: z
    .string()
    .min(3, 'Username минимум 3 символа')
    .max(32, 'Username максимум 32 символа')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Только буквы, цифры, _ и -'),
  password: z
    .string()
    .min(8, 'Пароль минимум 8 символов')
    .max(128, 'Пароль максимум 128 символов'),
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Введите email или username'),
  password: z.string().min(1, 'Введите пароль'),
});

export const createPageSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(200, 'Заголовок до 200 символов'),
  content: z.string().min(1, 'Содержимое обязательно').max(100_000, 'Слишком длинно'),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(100_000).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Пустой комментарий').max(5000, 'Слишком длинно'),
  parentId: z.string().cuid().optional(),
});

export const updateProfileSchema = z.object({
  bio: z.string().max(500, 'Био до 500 символов').nullable().optional(),
});
