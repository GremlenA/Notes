import { fetchNotes, deleteNote } from '@/lib/api/serverApi';
import { calculateDynamicPriority } from '@/utils/priority';

export async function POST() {
  try {
    const data = await fetchNotes(1, ''); 
    const notes = data.notes;
    
    let deletedCount = 0;
    const threshold = 10; 

    for (const note of notes) {
      const score = calculateDynamicPriority(note.content, note.createdAt, note.updatedAt);
      
      // Старые заметки (100 баллов) никогда не упадут ниже порога 10
      if (score < threshold) {
        try {
          await deleteNote(note.id);
          deletedCount++;
        } catch (error) {
          if (error instanceof Error && error.message.includes('404')) {
            console.log(`Заметка ${note.id} уже удалена.`);
          }
        }
      }
    }

    return Response.json({ 
      message: `Очистка завершена. Удалено: ${deletedCount}`,
      status: 'success',
      deletedCount
    });
  } catch (error) {
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}