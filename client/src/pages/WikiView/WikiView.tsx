import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deletePage, getPage, type WikiPage } from '../../api/pages';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Markdown } from '../../components/Markdown';
import { Comments } from '../../components/Comments';
import styles from './WikiView.module.css';

export function WikiViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [page, setPage] = useState<WikiPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setError(null);
    setPage(null);
    getPage(slug)
      .then(setPage)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ошибка'));
  }, [slug]);

  async function handleDelete() {
    if (!page) return;
    if (!window.confirm(`Удалить страницу "${page.title}"?`)) return;
    setDeleting(true);
    try {
      await deletePage(page.slug);
      navigate('/wiki');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось удалить');
      setDeleting(false);
    }
  }

  if (error) return <div className={styles.error}>{error}</div>;
  if (!page) return <div>Загрузка…</div>;

  const canDelete = user?.id === page.authorId;

  return (
    <article>
      <header className={styles.header}>
        <h1 className={styles.title}>{page.title}</h1>
        <div className={styles.meta}>
          Автор: <Link to={`/u/${page.author.username}`}>@{page.author.username}</Link>
          {' · '}
          обновлено {formatDate(page.updatedAt)}
        </div>
        {user && (
          <div className={styles.actions}>
            <Link to={`/wiki/${page.slug}/edit`} className={styles.editBtn}>Редактировать</Link>
            {canDelete && (
              <button type="button" className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Удаление…' : 'Удалить'}
              </button>
            )}
          </div>
        )}
      </header>

      <Markdown>{page.content}</Markdown>

      <Comments slug={page.slug} />
    </article>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
}
