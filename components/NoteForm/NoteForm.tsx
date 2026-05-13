"use client";

import React, { useState } from "react";
import css from "./NoteForm.module.css";
import type { NewNote } from "../../types/note";
import { createNote } from '@/lib/api/clientApi';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useNoteStore } from "@/lib/store/noteStore";

const tagOptions = ["Todo", "Work", "Personal", "Meeting", "Shopping"] as const;

// 🟢 НОВЕ: Опції для пріоритету замість терміну життя
const priorityOptions = [
  { label: "🟩 Важлива (Зберегти назавжди)", value: "100" },
  { label: "🟨 Звичайна (Середній пріоритет)", value: "60" },
  { label: "🟥 Тимчасова (Сміттєвоз видалить її)", value: "30" },
];

type NoteFormProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

export default function NoteForm({ onCancel, onSuccess }: NoteFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  
  // 🟢 НОВЕ: Локальний стан для обраного пріоритету (за замовчуванням 100 - Важлива)
  const [selectedPriority, setSelectedPriority] = useState("100");

  const draft = useNoteStore((s) => s.draft);
  const setDraft = useNoteStore((s) => s.setDraft);
  const clearDraft = useNoteStore((s) => s.clearDraft);

  const mutation = useMutation({
    mutationFn: (data: NewNote) => createNote(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      clearDraft();

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    },
  });

  const handleCreate = async (formData: FormData) => {
    const title = String(formData.get("title") ?? "");
    const rawContent = String(formData.get("content") ?? "");
    const tag = String(formData.get("tag") ?? "Todo") as NewNote["tag"];

    // 🟢 НОВЕ: Ховаємо пріоритет у текст контенту перед відправкою
    const contentWithPriority = `[PRIORITY:${selectedPriority}] ${rawContent}`;

    await mutation.mutateAsync({ 
      title, 
      content: contentWithPriority, 
      tag 
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className={css.wrapper}>
      <h2 className={css.header}>Create note</h2>

      <form className={css.form}>
        <div className={css.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            className={css.input}
            required
            value={draft.title}
            onChange={(e) =>
              setDraft({ ...draft, title: e.target.value })
            }
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            rows={8}
            className={css.textarea}
            value={draft.content}
            onChange={(e) =>
              setDraft({ ...draft, content: e.target.value })
            }
          />
        </div>

        {/* Рядок з двома селектами: Тег та Пріоритет */}
        <div className={css.row}>
          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <select
              id="tag"
              name="tag"
              className={css.select}
              value={draft.tag}
              onChange={(e) =>
                setDraft({ ...draft, tag: e.target.value })
              }
            >
              {tagOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 🟢 НОВЕ: Селект для вибору пріоритету */}
          <div className={css.formGroup}>
            <label htmlFor="priority">Пріоритет нотатки</label>
            <select
              id="priority"
              name="priority"
              className={css.select}
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={css.actions}>
          <button
            type="button"
            className={css.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            formAction={handleCreate}
            className={css.submitButton}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create note"}
          </button>
        </div>
      </form>
    </div>
  );
}