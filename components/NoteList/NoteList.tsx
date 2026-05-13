"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import css from "./NoteList.module.css";
import type { Note } from "../../types/note";
import { deleteNote } from "../../lib/api";
import Link from "next/link";
import { calculateDynamicPriority, cleanContent } from '@/utils/priority';

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch('/api/notes/cleanup', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.deletedCount > 0) qc.invalidateQueries({ queryKey: ["notes"] });
        }
      } catch (e) { console.error(e); }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [qc]);

  const delMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });

  if (!notes || notes.length === 0) return <p>No notes found</p>;

  // Сортировка: старые заметки без тега имеют 100 и всегда будут первыми
  const sortedNotes = [...notes].map(note => ({
    ...note,
    priority: calculateDynamicPriority(note.content, note.createdAt, note.updatedAt)
  })).sort((a, b) => b.priority - a.priority);

  return (
    <ul className={css.list}>
      {sortedNotes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{cleanContent(note.content)}</p>

          <div style={{ 
            fontSize: '11px', 
            color: note.priority === 100 ? '#2e7d32' : '#757575',
            fontWeight: note.priority === 100 ? 'bold' : 'normal',
            marginBottom: '8px'
          }}>
             {note.priority === 100 ? "⭐ СИСТЕМНАЯ / ВАЖНАЯ" : `Приоритет: ${note.priority}/100`}
          </div>

          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <Link href={`/notes/${note.id}`} className={css.link}>Details</Link>
            <button 
              className={css.button} 
              onClick={() => delMutation.mutate(note.id)}
              disabled={delMutation.isPending}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}