import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tag: string;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const authHeader = { Cookie: cookieStore.toString() };

    const response = await api.get('notes', { headers: authHeader });
    const responseData = response.data;
    
    const notesList: Note[] = Array.isArray(responseData) 
      ? responseData 
      : (responseData?.notes || []);

    const now = Date.now();
    const ttlRegex = /\[TTL:(\d+)\]/;
    
    // Починаємо перевірку кожної нотатки
    const expiredNotes = notesList.filter((note: Note) => {
      if (!note.content) return false;

      const match = note.content.match(ttlRegex);
      
      if (match && match[1]) {
        const expirationTime = parseInt(match[1], 10);
        const timeLeft = Math.round((expirationTime - now) / 1000);
        
        if (timeLeft > 0) {
          // Якщо час ще є, виводимо таймер у термінал
          console.log(`⏳ Нотатка "${note.title}": ще жива. До видалення: ${timeLeft} сек.`);
          return false;
        } else {
          // Якщо час вийшов (timeLeft <= 0)
          console.log(`💥 Нотатка "${note.title}": ЧАС ВИЙШОВ! Готуємо до видалення.`);
          return true;
        }
      }
      return false; // Це звичайні нотатки без мітки TTL
    });

    if (expiredNotes.length === 0) {
      return NextResponse.json({ message: 'Сміття не знайдено' });
    }

    // Видалення
    await Promise.all(
      expiredNotes.map((note: Note) => 
        api.delete(`notes/${note.id}`, { headers: authHeader })
      )
    );

    console.log(`✅ Сміттєвоз успішно видалив нотаток: ${expiredNotes.length}`);

    return NextResponse.json({ 
      message: 'Очищення завершено', 
      deletedCount: expiredNotes.length 
    });

  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: 'Cleanup failed', details: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}