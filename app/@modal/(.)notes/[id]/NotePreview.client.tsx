"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Modal from "@/components/Modal/Modal";
// Убедись, что updateNote экспортируется из твоего файла api!
import { fetchNoteById, updateNote } from "@/lib/api"; 

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

  // --- ИНТЕЛЛЕКТУАЛЬНАЯ СИСТЕМА: Фиксация просмотра ---
  useEffect(() => {
    // Если данные еще не загрузились, ничего не делаем
    if (!note || !note.id) return;

    const markAsViewed = async () => {
      try {
        // Отправляем "холостой" запрос. 
        // Мы передаем тот же самый title, поэтому визуально ничего не меняется,
        // но бекенд обновляет поле updatedAt на текущее время!
        await updateNote(note.id, { title: note.title }); 
        console.log(`[Smart System]: Нотатка ${note.id} прочитана. Приоритет повышен!`);
      } catch (e) {
        console.error("[Smart System]: Не удалось обновить приоритет", e);
      }
    };

    // Запускаем таймер: засчитываем просмотр только если пользователь 
    // читает нотатку дольше 3 секунд
    const timer = setTimeout(markAsViewed, 3000);

    // Функция очистки: если пользователь быстро закрыл нотатку (до 3 сек),
    // таймер сбрасывается и просмотр не засчитывается.
    return () => clearTimeout(timer);
  }, [note]); 
  // ----------------------------------------------------

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