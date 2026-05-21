import { api } from './client';

export type Comment = {
  id: string;
  content: string;
  authorId: string;
  pageId: string;
  parentId: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
};

export async function listComments(slug: string): Promise<Comment[]> {
  const res = await api<{ comments: Comment[] }>(`/pages/${encodeURIComponent(slug)}/comments`);
  return res.comments;
}

export async function createComment(slug: string, content: string, parentId?: string): Promise<Comment> {
  const res = await api<{ comment: Comment }>(`/pages/${encodeURIComponent(slug)}/comments`, {
    method: 'POST',
    body: { content, parentId },
  });
  return res.comment;
}

export async function deleteComment(id: string): Promise<void> {
  await api<{ ok: true }>(`/comments/${id}`, { method: 'DELETE' });
}
