import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPages, type WikiPageListItem } from '../../api/pages';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import styles from './WikiList.module.css';

export function WikiListPage() {
  const { user } = useAuth();
  const [pages, setPages] = useState<WikiPageListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPages()
      .then(setPages)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить'));
  }, []);

  if (error) return <div className={styles.error}>{error}</div>;
  if (pages === null) return <div>Загрузка…</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Wiki-страницы</h1>
        {user && (
          <Link to="/wiki/new" className={styles.newBtn}>
            + Создать страницу
          </Link>
        )}
      </div>

      {pages.length === 0 ? (
        <p className={styles.empty}>
          Пока ни одной страницы. {user ? 'Создай первую!' : 'Войди, чтобы создать первую.'}
        </p>
      ) : (
        <ul className={styles.list}>
          {pages.map((p) => (
            <li key={p.id} className={styles.item}>
              <Link to={`/wiki/${p.slug}`} className={styles.title}>{p.title}</Link>
              <div className={styles.meta}>
                <Link to={`/u/${p.author.username}`}>@{p.author.username}</Link>
                <span> · обновлено {formatDate(p.updatedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
}