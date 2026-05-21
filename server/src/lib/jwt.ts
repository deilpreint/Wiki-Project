import jwt from 'jsonwebtoken';

// JWT (JSON Web Token) — это подписанная строка вида header.payload.signature.
// Сервер подписывает её своим JWT_SECRET и отдаёт клиенту. При следующем
// запросе клиент шлёт токен обратно, сервер проверяет подпись и доверяет payload'у.
// Главное: payload НЕ зашифрован, только подписан. Не клади туда секреты.

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET не задан в .env');
}

const EXPIRES_IN = '7d'; // токен живёт неделю

export type JwtPayload = {
  userId: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET!, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET!) as JwtPayload;
    return decoded;
  } catch {
    // Невалидная подпись, просроченный токен и т.п. → считаем "не залогинен"
    return null;
  }
}
