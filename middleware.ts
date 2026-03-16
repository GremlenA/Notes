import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const PRIVATE_ROUTES = ["/profile", "/notes"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Шукаємо КОНКРЕТНУ куку від бекенда. Бекенд GoIT зазвичай ставить accessToken (або refreshToken)
  const hasSession = request.cookies.has('accessToken') || request.cookies.has('refreshToken');

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isPrivateRoute = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));

  // Якщо неавторизований лізе в приватний роут -> на логін
  if (!hasSession && isPrivateRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Якщо авторизований лізе на сторінку логіну/реєстрації -> у профіль
  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};