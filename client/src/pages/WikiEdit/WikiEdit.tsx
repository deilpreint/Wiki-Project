import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPage, getPage, updatePage } from '../../api/pages';
import { ApiError } from '../../api/client';
import styles from './WikiEdit.module.css';

export function WikiEditPage({ mode }: { mode: 'create' | 'edit' }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(mode === 'create');

  useEffect(() => {
    if (mode !== 'edit' || !slug) return;
    getPage(slug)
      .then((p) => {
        setTitle(p.title);
        setContent(p.content);
        setLoaded(true);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить'));
  }, [mode, slug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const saved = mode === 'create'
        ? await createPage({ title, content })
        : await updatePage(slug!, { title, content });
      navigate(`/wiki/${saved.slug}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка сохранения');
      setBusy(false);
    }
  }

  if (!loaded) return <div>Загрузка…</div>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>{mode === 'create' ? 'Новая страница' : 'Редактирование'}</h1>

      <label className={styles.field}>
        <span>Заголовок</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          autoFocus
        />
      </label>

      <label className={styles.field}>
        <span>Содержимое (markdown)</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          required
          placeholder={'# Заголовок\n\nТекст в **markdown**…'}
          className={styles.textarea}
        />
      </label>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)}>
          Отмена
        </button>
        <button type="submit" className={styles.submitBtn} disabled={busy}>
          {busy ? 'Сохранение…' : mode === 'create' ? 'Создать' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
