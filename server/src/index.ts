import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import pagesRouter from './routes/pages.js';
import commentsRouter from './routes/comments.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/pages', pagesRouter);
app.use('/api', commentsRouter);
app.use('/api/users', usersRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
