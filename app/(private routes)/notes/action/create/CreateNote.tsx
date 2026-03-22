"use client";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./CreateNote.module.css";
import { useRouter } from "next/navigation";

function CreateNote() {
  const router = useRouter();

  const onClose = () => {
    router.back();
  };

  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        {<NoteForm onCancel={onClose} />}
      </div>
    </main>
  );
}

export default CreateNote;
