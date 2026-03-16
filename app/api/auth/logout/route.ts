import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // 1. Відправляємо запит саме на LOGOUT, передаючи наші куки
    await api.post('auth/logout', {}, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    // 2. Жорстко видаляємо куки в нашому Next.js додатку
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Навіть якщо бекенд видав помилку (наприклад, 400 сесії вже немає),
    // ми ВСЕ ОДНО маємо видалити куки з браузера, щоб розлогінити користувача!
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      // Повертаємо 200, щоб фронтенд знав, що локально ми успішно розлогінилися
      return NextResponse.json({ success: true, note: 'Cleared locally' }, { status: 200 });
    }
    
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}