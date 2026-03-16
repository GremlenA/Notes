"use client";

import React from "react";
import css from "./NoteForm.module.css";
import type { NewNote } from "../../types/note";
import { createNote } from '@/lib/api/clientApi';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useNoteStore } from "@/lib/store/noteStore";

const tagOptions = ["Todo", "Work", "Personal", "Meeting", "Shopping"] as const;

type NoteFormProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

export default function NoteForm({ onCancel, onSuccess }: NoteFormProps) {
  const router = useRouter();
  const qc = useQueryClient();

  
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
    const content = String(formData.get("content") ?? "");
    const tag = String(formData.get("tag") ?? "Todo") as NewNote["tag"];

    await mutation.mutateAsync({ title, content, tag });
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
