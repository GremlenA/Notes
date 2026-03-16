import { NextRequest, NextResponse } from 'next/server';
import { api } from '../api'; 
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';

// 1. Отримання списку нотаток (це те, що ми робили раніше)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams.toString();
  
  try {
    const cookieStore = await cookies();

    const res = await api.get(`notes?${searchParams}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    
    return NextResponse.json(res.data);
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// 2. СТВОРЕННЯ НОВОЇ НОТАТКИ (Це те, що виправить помилку 405!)
export async function POST(req: NextRequest) {
  try {
    // Читаємо дані, які прийшли з форми (title, content, tag)
    const body = await req.json();
    const cookieStore = await cookies();

    // Пересилаємо їх на бекенд GoIT разом із куками
    const res = await api.post('notes', body, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    
    // Повертаємо створену нотатку назад на фронтенд
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}