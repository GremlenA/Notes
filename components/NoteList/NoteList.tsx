"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import css from "./NoteList.module.css";
import type { Note } from "../../types/note";
import { deleteNote } from "../../lib/api";
import Link from "next/link";

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =====================================================================
  // АВТОМАТИЧНИЙ СМІТТЄВОЗ (Фонове очищення)
  // =====================================================================
  useEffect(() => {
    const runCleanup = async () => {
      try {
        const res = await fetch('/api/notes/cleanup', { method: 'POST' });
        
        if (res.ok) {
          const data = await res.json();
          // Якщо знайшли і видалили сміття - оновлюємо список на екрані
          if (data.deletedCount && data.deletedCount > 0) {
            console.log(`[Сміттєвоз]: Знайдено та видалено ${data.deletedCount} прострочених нотаток.`);
            qc.invalidateQueries({ queryKey: ["notes"] }); 
          }
        }
      } catch (error) {
        console.error('Помилка фонового очищення:', error);
      }
    };

    runCleanup();
  }, [qc]);
  // =====================================================================

  const delMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onMutate: (id: string) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  if (!notes || notes.length === 0) {
    return <p>No notes found</p>;
  }

  return (
    <ul className={css.list}>
      {notes.map((note) => {
        // ВИПРАВЛЕНО: Тепер ми вирізаємо нову мітку у квадратних дужках [TTL:123...]
        // TSX більше не буде на це сваритися, і мітка не вилізе на екран!
        const cleanContent = note.content 
          ? note.content.replace(/\[TTL:\d+\]/g, '').trim() 
          : '';

        return (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            
            {/* Виводимо очищений контент */}
            <p className={css.content}>{cleanContent}</p>

            <div className={css.footer}>
              {/* Tag */}
              <span className={css.tag}>{note.tag}</span>

              {/* View details */}
              <Link href={`/notes/${note.id}`} className={css.link}>
                View details
              </Link>

              {/* Delete */}
              <button
                className={css.button}
                disabled={deletingId === note.id}
                onClick={() => {
                  if (window.confirm("Delete this note?")) {
                    delMutation.mutate(note.id);
                  }
                }}
              >
                {deletingId === note.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}