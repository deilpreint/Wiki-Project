import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styles from './Header.module.css';

export function Header() {
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>Wiki</Link>

        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            Главная
          </NavLink>
          <NavLink to="/wiki" className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}>
            Wiki
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={toggle}
            className={styles.themeBtn}
            title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
            aria-label="Переключить тему"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {loading ? null : user ? (
            <>
              <Link to={`/u/${user.username}`} className={styles.userLink}>@{user.username}</Link>
              <button type="button" onClick={handleLogout} className={styles.logoutBtn}>Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>Войти</Link>
              <Link to="/register" className={styles.registerBtn}>Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
