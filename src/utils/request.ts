// ============================================================
// Utilitário para extrair IP e User-Agent de requests
// ============================================================

import { NextRequest } from 'next/server';

export function getClientInfo(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || null;

  const userAgent = request.headers.get('user-agent') || null;

  return { ip, userAgent };
}
