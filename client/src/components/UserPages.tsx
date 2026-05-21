import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listUserPages, type WikiPageListItem } from '../api/pages';
import { ApiError } from '../api/client';
import styles from './UserPages.module.css';

export function UserPages({ username }: { username: string }) {
  const [pages, setPages] = useState<WikiPageListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPages(null);
    listUserPages(username)
      .then((data) => { if (!cancelled) setPages(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Ошибка'); });
    return () => { cancelled = true; };
  }, [username]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (pages === null) return <div>Загрузка…</div>;
  if (pages.length === 0) {
    return <p className={styles.empty}>@{username} ещё не создавал wiki-страниц.</p>;
  }

  return (
    <ul className={styles.list}>
      {pages.map((p) => (
        <li key={p.id} className={styles.item}>
          <Link to={`/wiki/${p.slug}`} className={styles.title}>{p.title}</Link>
          <div className={styles.meta}>обновлено {formatDate(p.updatedAt)}</div>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
}
