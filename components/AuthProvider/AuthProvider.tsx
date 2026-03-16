'use client';

import { checkSession, getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useState } from 'react';

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. Спочатку перевіряємо, чи є сесія взагалі
        const isAuthenticated = await checkSession();

        // 2. Якщо сесії немає - одразу очищаємо стан і зупиняємось!
        if (!isAuthenticated) {
          clearIsAuthenticated();
          return;
        }

        // 3. Якщо сесія є, безпечно дістаємо дані профілю
        const user = await getMe();
        if (user) {
          setUser(user);
        }
      } catch {
        // Якщо десь сталась помилка (наприклад 401), скидаємо авторизацію
        clearIsAuthenticated();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setUser, clearIsAuthenticated]);

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  return children;
};

export default AuthProvider;