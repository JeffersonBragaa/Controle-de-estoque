// ============================================================
// Helper para extrair usuário autenticado da Request
// Uso em API Routes (Node Runtime)
// ============================================================

import { NextRequest } from 'next/server';
import { validarAccessToken } from './jwt';
import type { JWTPayload } from '@/types';

/**
 * Extrai o usuário autenticado do header Authorization.
 * Retorna null se o token for inválido ou ausente.
 */
export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return validarAccessToken(token);
}
