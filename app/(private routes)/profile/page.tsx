import Image from 'next/image';
import css from './ProfilePage.module.css';
import Link from 'next/link';
import { Metadata } from 'next';
import { getServerMe } from '@/lib/api/serverApi';
// Тимчасово прибираємо імпорт redirect

export const metadata: Metadata = {
  title: 'Your profile',
  description: 'Your profile page',
};

const ProfilePage = async () => {
  let user = null;
  let errorMessage = "";

 try {
    user = await getServerMe();
  } catch (error) {
    // Перевіряємо, чи є помилка стандартним об'єктом Error
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      // Якщо сервер кинув щось нестандартне (наприклад, рядок)
      errorMessage = String(error);
    }
  }

  // ДЕТЕКТИВНИЙ БЛОК: Якщо сталася помилка, виводимо її червоним текстом на екран
  if (!user) {
    return (
      <main style={{ padding: '50px', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>🚨 Спіймали помилку сервера!</h1>
        <p>Чому сторінка не завантажилась на Vercel:</p>
        <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', padding: '20px', borderRadius: '8px', margin: '20px 0', maxWidth: '600px', width: '100%', wordWrap: 'break-word', color: '#b71c1c' }}>
          <code>{errorMessage || "Дані користувача не повернулися (null)"}</code>
        </div>
        <Link href="/sign-in" style={{ padding: '10px 20px', background: '#1976d2', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
          Повернутися до входу
        </Link>
      </main>
    );
  }

  // Якщо все добре — показуємо нормальний профіль
  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>
        
        <div className={css.avatarWrapper}>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt="User Avatar"
              width={120}
              height={120}
              className={css.avatar}
            />
          ) : (
            <div 
              className={css.avatar} 
              style={{ width: 120, height: 120, backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#555', fontWeight: 'bold' }}
            >
              <span>No Avatar</span>
            </div>
          )}
        </div>

        <div className={css.profileInfo}>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;