import { User } from '@/types/user';
import { nextServer } from './api';
import { NewNote, Note } from '@/types/note';

export type RegisterRequest = {
  email: string;
  password: string;
};

export const register = async (data: RegisterRequest) => {
  const res = await nextServer.post<User>('/auth/register', data);
  return res.data;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export const login = async (data: LoginRequest) => {
  const res = await nextServer.post<User>('/auth/login', data);
  return res.data;
};

export const logout = async (): Promise<void> => {

  await nextServer.post('/auth/logout', {});
};

type CheckSessionRequest = {
  success: boolean;
};

export const checkSession = async () => {
  const res = await nextServer.get<CheckSessionRequest>('/auth/session');
  return res.data.success;
};

export const getMe = async () => {
  const { data } = await nextServer.get<User>('/users/me');
  return data;
};

export type UpdateUserRequest = {
  username?: string;
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const { data } = await nextServer.patch<User>('/users/me', payload);
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
  const { data } = await nextServer.get<FetchNotesHttpResponse>('/notes', {
    params: {
      search,
      tag,
      page,
      perPage: 12,
    },
  });
  return data;
};

export const fetchNoteById = async (id: Note['id']): Promise<Note> => {
  const { data } = await nextServer.get<Note>(`/notes/${id}`);
  return data;
};

export const createNote = async (newNote: NewNote): Promise<Note> => {
  const { data } = await nextServer.post<Note>('/notes', newNote);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await nextServer.delete<Note>(`/notes/${id}`);
  return data;
};
