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
  // АВТОМАТИЧНИЙ СМІТТЄВОЗ (Фонове очищення з таймером)
  // =====================================================================
  useEffect(() => {
    let isChecking = true; // Прапорець активності

    const runCleanup = async () => {
      // Якщо прапорець опущений (сесія закінчилась) — нічого не робимо
      if (!isChecking) return;

      try {
        const res = await fetch('/api/notes/cleanup', { method: 'POST' });
        
        if (res.status === 401) {
          console.log('[Сміттєвоз]: Сесія закінчилася. Зупиняю патруль.');
          isChecking = false; // Опускаємо прапорець
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.deletedCount && data.deletedCount > 0) {
            console.log(`[Сміттєвоз]: Видалено ${data.deletedCount} нотаток. Оновлюю інтерфейс...`);
            qc.invalidateQueries({ queryKey: ["notes"] }); 
          }
        }
      } catch (error) {
        console.error('Помилка фонового очищення:', error);
      }
    };

    // 1. Перший запуск
    runCleanup();

    // 2. Тепер ESLint абсолютно щасливий, бо ми використали const!
    const intervalId = setInterval(runCleanup, 10000);

    // 3. Очищення при виході зі сторінки
    return () => {
      isChecking = false;
      clearInterval(intervalId);
    };
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
      
        const cleanContent = note.content 
          ? note.content.replace(/\[TTL:\d+\]/g, '').trim() 
          : '';

        return (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            
       
            <p className={css.content}>{cleanContent}</p>

            <div className={css.footer}>
        
              <span className={css.tag}>{note.tag}</span>

             
              <Link href={`/notes/${note.id}`} className={css.link}>
                View details
              </Link>

             
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