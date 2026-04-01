import { cookies } from 'next/headers';
import { nextServer } from './api';
import { User } from '@/types/user';
import { Note } from '@/types/note';

// 🛠 НОВА ФУНКЦІЯ: Надійно збирає куки в правильний рядок для Vercel
const getCookieHeader = async () => {
  const cookieStore = await cookies();
  // Дістаємо всі куки поштучно і склеюємо їх у формат "name=value; name2=value2"
  return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
};

export const checkServerSession = async () => {
  const cookieString = await getCookieHeader();
  const res = await nextServer.get('/auth/session', {
    headers: {
      Cookie: cookieString,
    },
  });
  return res;
};

export const getServerMe = async (): Promise<User> => {
  const cookieString = await getCookieHeader();
  const { data } = await nextServer.get<User>('/users/me', {
    headers: {
      Cookie: cookieString,
    },
  });
  return data;
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
  const cookieString = await getCookieHeader();

  const { data } = await nextServer.get<FetchNotesHttpResponse>('/notes', {
    params: {
      search,
      tag,
      page,
      perPage: 12,
    },
    headers: {
      Cookie: cookieString,
    },
  });
  return data;
};

export const fetchNoteById = async (id: Note['id']): Promise<Note> => {
  const cookieString = await getCookieHeader();

  const { data } = await nextServer.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieString,
    },
  });
  return data;
};