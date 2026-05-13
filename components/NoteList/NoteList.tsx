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

  // 🟢 НОВОЕ: Стейт-таймер для живого обновления экрана
  const [, setTick] = useState(0);

  // 🟢 НОВОЕ: Эффект, который заставляет React пересчитывать баллы каждую секунду
  useEffect(() => {
    const liveTimer = setInterval(() => {
      setTick(t => t + 1); // Просто дергаем стейт, чтобы вызвать рендер
    }, 1000); // Каждую 1 секунду экран будет обновляться

    return () => clearInterval(liveTimer);
  }, []);

  // =====================================================================
  // АВТОМАТИЧНИЙ СМІТТЄВОЗ (Фонове очищення з таймером)
  // =====================================================================
  useEffect(() => {
    let isChecking = true;

    const runCleanup = async () => {
      if (!isChecking) return;

      try {
        const res = await fetch('/api/notes/cleanup', { method: 'POST' });
        
        if (res.status === 401) {
          console.log('[Сміттєвоз]: Сесія закінчилася. Зупиняю патруль.');
          isChecking = false;
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

    runCleanup();
    // Сметтевоз ездит каждые 10 секунд
    const intervalId = setInterval(runCleanup, 10000);

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

  // =====================================================================
  // ГІБРИДНА СОРТИРОВКА (Базовий пріоритет - Час + Перегляди)
  // =====================================================================
  const sortedNotes = [...notes].map(note => ({
    ...note,
    priority: calculateDynamicPriority(note.content, note.createdAt, note.updatedAt)
  })).sort((a, b) => b.priority - a.priority);

  return (
    <ul className={css.list}>
      {sortedNotes.map((note) => {
      
        const displayContent = cleanContent(note.content);

        return (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            
            <p className={css.content}>{displayContent}</p>

            {/* Візуальний індикатор динамічного пріоритету */}
            <div style={{ 
              fontSize: '12px', 
              color: note.priority === 100 ? '#2e7d32' : '#757575',
              fontWeight: note.priority === 100 ? 'bold' : 'normal',
              marginBottom: '10px' 
            }}>
               {note.priority === 100 ? "⭐ Системна / Важлива" : `⏳ Динамічний пріоритет: ${note.priority}/100`}
            </div>

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