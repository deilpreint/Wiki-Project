import { api } from './client';
import type { User } from './auth';

export type PublicProfile = {
  id: string;
  username: string;
  bio: string | null;
  createdAt: string;
};

export async function getProfile(username: string): Promise<PublicProfile> {
  const res = await api<{ user: PublicProfile }>(`/users/${encodeURIComponent(username)}`);
  return res.user;
}

export async function updateMyProfile(data: { bio: string | null }): Promise<User> {
  const res = await api<{ user: User }>('/users/me', { method: 'PUT', body: data });
  return res.user;
}
