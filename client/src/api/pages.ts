import { api } from './client';

export type PageAuthor = {
  id: string;
  username: string;
};

export type WikiPageListItem = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  author: PageAuthor;
};

export type WikiPage = WikiPageListItem & {
  content: string;
  authorId: string;
};

export async function listPages(): Promise<WikiPageListItem[]> {
  const res = await api<{ pages: WikiPageListItem[] }>('/pages');
  return res.pages;
}

export async function listUserPages(username: string): Promise<WikiPageListItem[]> {
  const res = await api<{ pages: WikiPageListItem[] }>(`/pages/by-user/${encodeURIComponent(username)}`);
  return res.pages;
}

export async function getPage(slug: string): Promise<WikiPage> {
  const res = await api<{ page: WikiPage }>(`/pages/${encodeURIComponent(slug)}`);
  return res.page;
}

export async function createPage(data: { title: string; content: string }): Promise<WikiPage> {
  const res = await api<{ page: WikiPage }>('/pages', { method: 'POST', body: data });
  return res.page;
}

export async function updatePage(slug: string, data: { title?: string; content?: string }): Promise<WikiPage> {
  const res = await api<{ page: WikiPage }>(`/pages/${encodeURIComponent(slug)}`, { method: 'PUT', body: data });
  return res.page;
}

export async function deletePage(slug: string): Promise<void> {
  await api<{ ok: true }>(`/pages/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}
