import { cookies, headers } from 'next/headers';
import { User } from '@/types/user';
import { Note } from '@/types/note';

// 1. Отримуємо точну адресу сайту (щоб обійти проблему Vercel)
const getBaseUrl = async () => {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/api`;
};

// 2. Надійно збираємо куки
const getCookieHeader = async () => {
  const cookieStore = await cookies();
  return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');
};

export const checkServerSession = async () => {
  const baseUrl = await getBaseUrl();
  const cookieString = await getCookieHeader();

  const res = await fetch(`${baseUrl}/auth/session`, {
    cache: 'no-store', // Обов'язково вимикаємо кеш
    headers: { Cookie: cookieString },
  });
  return res;
};

// 3. Використовуємо нативний fetch замість axios
export const getServerMe = async (): Promise<User> => {
  const baseUrl = await getBaseUrl();
  const cookieString = await getCookieHeader();

  const res = await fetch(`${baseUrl}/users/me`, {
    cache: 'no-store',
    headers: { Cookie: cookieString },
  });

  if (!res.ok) {
    throw new Error(`Request failed with status code ${res.status}`);
  }
  return res.json();
};

interface FetchNotesHttpResponse {
  notes: Note[];
  totalPages: number;
}

export const fetchNotes = async (
  page: number,
  search: string,
  tag?: string,
): Promise<FetchNotesHttpResponse> => {
  const baseUrl = await getBaseUrl();
  const cookieString = await getCookieHeader();

  // Формуємо параметри запиту для fetch
  const q = new URLSearchParams();
  if (search) q.set('search', search);
  if (tag) q.set('tag', tag);
  q.set('page', String(page));
  q.set('perPage', '12');

  const res = await fetch(`${baseUrl}/notes?${q.toString()}`, {
    cache: 'no-store',
    headers: { Cookie: cookieString },
  });

  if (!res.ok) {
    throw new Error(`Request failed with status code ${res.status}`);
  }
  return res.json();
};

export const fetchNoteById = async (id: Note['id']): Promise<Note> => {
  const baseUrl = await getBaseUrl();
  const cookieString = await getCookieHeader();

  const res = await fetch(`${baseUrl}/notes/${id}`, {
    cache: 'no-store',
    headers: { Cookie: cookieString },
  });

  if (!res.ok) {
    throw new Error(`Request failed with status code ${res.status}`);
  }
  return res.json();
};