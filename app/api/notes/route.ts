import { NextRequest, NextResponse } from 'next/server';
import { api } from '../api'; 
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams.toString();
  try {
    const cookieStore = await cookies();
    const res = await api.get(`notes?${searchParams}`, {
      headers: { Cookie: cookieStore.toString() },
    });
    return NextResponse.json(res.data);
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message }, 
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, tag, ttl } = body; 
    const cookieStore = await cookies();

    const safeTag = tag || 'Todo';
    let modifiedContent = content;

    if (ttl && ttl !== "") {
      const msMap: Record<string, number> = {
        'test': 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '5d': 5 * 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
      };

      if (msMap[ttl]) {
        const expirationTimestamp = Date.now() + msMap[ttl];
        // ВИПРАВЛЕНО: Тепер мітка [TTL:12345...] надійно додається в кінець тексту
        modifiedContent = `${content}\n\n[TTL:${expirationTimestamp}]`;
      }
    }

    const res = await api.post('notes', 
      { title, content: modifiedContent, tag: safeTag }, 
      { headers: { Cookie: cookieStore.toString() } }
    );
    
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message, details: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}