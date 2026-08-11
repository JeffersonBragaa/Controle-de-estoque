// ============================================================
// Middleware — Proteção de rotas (Edge Runtime)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Rotas públicas de página (não precisam de auth)
const PUBLIC_PAGE_ROUTES = ['/login', '/forgot-password', '/reset-password'];

// Rotas de API públicas (não precisam de auth)
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/setup-admin',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

// Rotas de assets estáticos e Next.js internals (ignorar)
const IGNORED_PREFIXES = ['/_next', '/favicon.ico', '/icon.png'];

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGE_ROUTES.some((route) => pathname === route);
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname === route);
}

function isIgnored(pathname: string): boolean {
  return IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;

    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar assets estáticos
  if (isIgnored(pathname)) {
    return NextResponse.next();
  }

  // Rotas de API públicas — permitir acesso
  if (isApiRoute(pathname) && isPublicApi(pathname)) {
    return NextResponse.next();
  }

  // Páginas públicas — se já autenticado, redirecionar para dashboard
  if (isPublicPage(pathname)) {
    const token = request.headers.get('authorization')?.substring(7);
    if (token) {
      const isValid = await validateToken(token);
      if (isValid) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // Rotas protegidas de API — verificar Authorization header
  if (isApiRoute(pathname)) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const isValid = await validateToken(token);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado.' },
        { status: 401 },
      );
    }

    return NextResponse.next();
  }

  // Páginas protegidas — a validação real do token acontece no AuthContext (client-side)
  // O middleware apenas verifica se o cookie de refresh existe como hint
  // Se não existe, redireciona para login
  const refreshCookie = request.cookies.get('refresh_token');
  if (!refreshCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
