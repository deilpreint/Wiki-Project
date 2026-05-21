import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { getProfile, updateMyProfile, type PublicProfile } from '../../api/users';
import { UserPages } from '../../components/UserPages';
import type { User } from '../../api/auth';
import styles from './Profile.module.css';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!username) return;
    setError(null);
    setProfile(null);
    getProfile(username)
      .then(setProfile)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ошибка'));
  }, [username]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return <div>Загрузка…</div>;

  const isMyProfile = user?.username === profile.username;

  function handleProfileSaved(updatedUser: User) {
    setUser(updatedUser);
    setProfile({
      id: updatedUser.id,
      username: updatedUser.username,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
    });
    setEditing(false);
  }

  return (
    <div>
      <header className={styles.head}>
        <h1 className={styles.username}>@{profile.username}</h1>
        <div className={styles.joined}>На сайте с {formatJoinDate(profile.createdAt)}</div>
        {profile.bio
          ? <p className={styles.bio}>{profile.bio}</p>
          : <p className={styles.bioEmpty}>Нет описания.</p>}
      </header>

      {isMyProfile && !editing && (
        <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
          Редактировать профиль
        </button>
      )}

      {isMyProfile && editing && (
        <ProfileEditForm
          profile={profile}
          onCancel={() => setEditing(false)}
          onSaved={handleProfileSaved}
        />
      )}

      <h2 className={styles.subhead}>Wiki-страницы</h2>
      <UserPages username={profile.username} />
    </div>
  );
}

function ProfileEditForm({
  profile,
  onCancel,
  onSaved,
}: {
  profile: PublicProfile;
  onCancel: () => void;
  onSaved: (user: User) => void;
}) {
  const [bio, setBio] = useState(profile.bio ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const updatedUser = await updateMyProfile({ bio: bio.trim() || null });
      onSaved(updatedUser);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.field}>
        <span>Описание (bio)</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Расскажи о себе…"
        />
        <small className={styles.hint}>{bio.length}/500</small>
      </label>
      {error && <div className={styles.errorInline}>{error}</div>}
      <div className={styles.actions}>
        <button type="button" className={styles.smallBtn} onClick={onCancel}>Отмена</button>
        <button type="submit" className={styles.submitBtn} disabled={busy}>
          {busy ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}

function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
