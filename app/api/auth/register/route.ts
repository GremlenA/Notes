import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

interface CookieOptions {
  path: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiRes = await api.post('auth/register', body);

    const cookieStore = await cookies();
    const setCookie = apiRes.headers['set-cookie'];

    if (setCookie) {
      const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
      for (const cookieStr of cookieArray) {
        const parsed = parse(cookieStr);
        const options: CookieOptions = { path: parsed.Path || '/' };
        if (parsed.Expires) options.expires = new Date(parsed.Expires);
        if (parsed['Max-Age']) options.maxAge = Number(parsed['Max-Age']);
        options.httpOnly = true;
        options.secure = process.env.NODE_ENV === 'production';

        if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options);
        if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options);
      }
    } else if (apiRes.data) {
      const accessToken = apiRes.data.accessToken || apiRes.data.data?.accessToken;
      const refreshToken = apiRes.data.refreshToken || apiRes.data.data?.refreshToken;
      if (accessToken) cookieStore.set('accessToken', accessToken, { path: '/' });
      if (refreshToken) cookieStore.set('refreshToken', refreshToken, { path: '/' });
    }

    return NextResponse.json(apiRes.data, { status: apiRes.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 400 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}