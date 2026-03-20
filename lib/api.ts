import axios from "axios";
import type { Note, NewNote } from "../types/note";


const api = axios.create({
  baseURL: "/api",
  withCredentials: true, 
});

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export const fetchNotes = async (
  params: FetchNotesParams = {}
): Promise<FetchNotesResponse> => {
  const { page = 1, perPage = 12, search, tag } = params;

  const q = new URLSearchParams();
  q.set("page", String(page));
  q.set("perPage", String(perPage));

  if (search?.trim()) q.set("search", search.trim());
  if (tag && tag !== "all") q.set("tag", tag);

  const res = await api.get<FetchNotesResponse>(`/notes?${q.toString()}`);
  return res.data;
};

export const fetchNoteById = async (id: string) => {
  const res = await api.get<Note>(`/notes/${id}`);
  return res.data;
};

export const createNote = async (data: NewNote) => {
  const res = await api.post<Note>("/notes", data);
  return res.data;
};

export const deleteNote = async (id: string) => {
  const res = await api.delete<Note>(`/notes/${id}`);
  return res.data;
};