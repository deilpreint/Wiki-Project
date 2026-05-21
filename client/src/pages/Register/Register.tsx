import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import styles from './Register.module.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({ email, username, password });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { issues?: { message: string }[] } | null;
        setError(body?.issues?.[0]?.message ?? err.message);
      } else {
        setError('Не удалось зарегистрироваться');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.card}>
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9_-]+"
            title="Только буквы, цифры, _ и -"
          />
        </label>

        <label className={styles.field}>
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <small className={styles.hint}>Минимум 8 символов</small>
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className={styles.altLink}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}
