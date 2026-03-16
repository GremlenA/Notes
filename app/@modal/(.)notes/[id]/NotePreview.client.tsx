"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Modal from "@/components/Modal/Modal";
import { fetchNoteById } from "@/lib/api";

type Props = {
  id: string;
};

export default function NoteModalClient({ id }: Props) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    enabled: !!id,
    refetchOnMount: false,
  });

  return (
    <Modal onClose={handleClose}>
      {isLoading && <p>Loading...</p>}

      {(error || !note) && !isLoading && (
        <p>Failed to load note</p>
      )}

      {note && (
        <div>
          <h2>{note.title}</h2>
          <p>
            <strong>Tag:</strong> {note.tag}
          </p>
          <p>{note.content}</p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(note.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </Modal>
  );
}
