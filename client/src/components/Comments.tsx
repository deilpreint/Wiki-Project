import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createComment, deleteComment, listComments, type Comment } from '../api/comments';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import styles from './Comments.module.css';

export function Comments({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listComments(slug)
      .then((data) => { setComments(data); setError(null); })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ошибка'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function addComment(content: string, parentId?: string) {
    const created = await createComment(slug, content, parentId);
    setComments((current) => [...current, created]);
  }

  async function removeComment(id: string) {
    if (!window.confirm('Удалить комментарий?')) return;
    await deleteComment(id);
    setComments((current) => current.filter((c) => c.id !== id && c.parentId !== id));
  }

  if (loading) return <div>Загрузка комментариев…</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const topLevel = comments.filter((c) => c.parentId === null);

  return (
    <section className={styles.section}>
      <h2>Комментарии ({comments.length})</h2>

      {topLevel.length === 0 && <p className={styles.empty}>Пока нет комментариев.</p>}

      <ul className={styles.list}>
        {topLevel.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={comments.filter((c) => c.parentId === comment.id)}
            currentUserId={user?.id ?? null}
            onReply={(content) => addComment(content, comment.id)}
            onDelete={removeComment}
          />
        ))}
      </ul>

      {user ? (
        <CommentForm onSubmit={(content) => addComment(content)} placeholder="Написать комментарий…" />
      ) : (
        <p className={styles.guestHint}>
          <Link to="/login">Войди</Link>, чтобы оставить комментарий.
        </p>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  replies,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: Comment;
  replies: Comment[];
  currentUserId: string | null;
  onReply: (content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const isMine = currentUserId === comment.authorId;

  async function handleReply(content: string) {
    await onReply(content);
    setReplyOpen(false);
  }

  return (
    <li className={styles.item}>
      <CommentHead author={comment.author.username} createdAt={comment.createdAt} />
      <div className={styles.body}>{comment.content}</div>

      <div className={styles.actions}>
        {currentUserId && (
          <button type="button" className={styles.linkBtn} onClick={() => setReplyOpen(!replyOpen)}>
            {replyOpen ? 'Отмена' : 'Ответить'}
          </button>
        )}
        {isMine && (
          <button type="button" className={styles.linkBtnDanger} onClick={() => onDelete(comment.id)}>
            Удалить
          </button>
        )}
      </div>

      {replyOpen && (
        <CommentForm
          onSubmit={handleReply}
          placeholder={`Ответить @${comment.author.username}…`}
          submitLabel="Ответить"
          autoFocus
        />
      )}

      {replies.length > 0 && (
        <ul className={styles.replies}>
          {replies.map((reply) => (
            <li key={reply.id} className={styles.replyItem}>
              <CommentHead author={reply.author.username} createdAt={reply.createdAt} />
              <div className={styles.body}>{reply.content}</div>
              {currentUserId === reply.authorId && (
                <div className={styles.actions}>
                  <button type="button" className={styles.linkBtnDanger} onClick={() => onDelete(reply.id)}>
                    Удалить
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function CommentHead({ author, createdAt }: { author: string; createdAt: string }) {
  return (
    <div className={styles.head}>
      <Link to={`/u/${author}`} className={styles.author}>@{author}</Link>
      <span className={styles.date}>{formatDate(createdAt)}</span>
    </div>
  );
}

function CommentForm({
  onSubmit,
  placeholder,
  submitLabel = 'Отправить',
  autoFocus,
}: {
  onSubmit: (content: string) => Promise<void>;
  placeholder: string;
  submitLabel?: string;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setBusy(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        required
        autoFocus={autoFocus}
      />
      {error && <div className={styles.errorInline}>{error}</div>}
      <button type="submit" className={styles.submitBtn} disabled={busy || !text.trim()}>
        {busy ? 'Отправка…' : submitLabel}
      </button>
    </form>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
}
