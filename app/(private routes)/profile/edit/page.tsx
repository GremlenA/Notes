'use client';

import Image from 'next/image';
import css from './EditProfilePage.module.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

const EditProfilePage = () => {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  // Ініціалізуємо локальний стан одразу даними зі стора.
  // Використовуємо порожній рядок як fallback, щоб інпут завжди був контрольованим.
  const [username, setUsername] = useState(user?.username || '');

  // Якщо юзера ще немає в сторі, нічого не рендеримо (уникнення помилок).
  // AuthProvider у цей час або показує лоадер, або робить редірект.
  if (!user) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const updatedUser = await updateMe({ username });
      setUser(updatedUser); // Оновлюємо глобальний стан новими даними
      router.push('/profile'); // Повертаємось на сторінку профілю
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleCancel = () => {
    router.back(); // Повертає на попередню сторінку
  };

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={user.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username} // Прив'язано до локального стану
              className={css.input}
              onChange={handleChange}
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton}>
              Save
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditProfilePage;