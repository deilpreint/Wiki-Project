import { api } from './client';

export type User = {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  createdAt: string;
};

export async function register(data: { email: string; username: string; password: string }): Promise<User> {
  const res = await api<{ user: User }>('/auth/register', { method: 'POST', body: data });
  return res.user;
}

export async function login(data: { emailOrUsername: string; password: string }): Promise<User> {
  const res = await api<{ user: User }>('/auth/login', { method: 'POST', body: data });
  return res.user;
}

export async function me(): Promise<User | null> {
  try {
    const res = await api<{ user: User }>('/auth/me');
    return res.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await api<{ ok: true }>('/auth/logout', { method: 'POST' });
}
