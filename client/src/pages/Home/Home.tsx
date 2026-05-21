import { useAuth } from '../../context/AuthContext';
import styles from './Home.module.css';

export function HomePage() {
  const { user } = useAuth();
  return (
    <div className={styles.home}>
      <h1>Добро пожаловать в Wiki</h1>
      <p className={styles.lead}>
        Небольшая wiki-площадка: создавай страницы, обсуждай их в комментариях,
        веди свой профиль и пиши посты.
      </p>
      {user ? (
        <p>Привет, <strong>@{user.username}</strong>!</p>
      ) : (
        <p>Зарегистрируйся, чтобы создавать страницы и комментировать.</p>
      )}
    </div>
  );
}