import Image from 'next/image';
import css from './ProfilePage.module.css';
import Link from 'next/link';
import { Metadata } from 'next';
import { getServerMe } from '@/lib/api/serverApi';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Your profile',
  description: 'Your profile page',
  openGraph: {
    title: `Your profile`,
    description: 'Your profile page',
    url: `https://09-auth-mu-wheat.vercel.app/profile`,
    siteName: 'NoteHub',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'NoteHub app banner',
      },
    ],
    type: 'article',
  },
};

const ProfilePage = async () => {
  let user;

  try {
    user = await getServerMe();
  } catch { 
    redirect('/sign-in');
  }

  if (!user) {
    redirect('/sign-in');
  }

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
          {/* НАДЕЖНАЯ ПРОВЕРКА: Если есть аватар - грузим Image, иначе - заглушку */}
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
              style={{ 
                width: 120, 
                height: 120, 
                backgroundColor: '#e0e0e0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '50%',
                color: '#555',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
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