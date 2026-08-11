// ============================================================
// Constantes de Autenticação
// ============================================================

import type { Role } from '@/types';

/** Tempo de expiração do Access Token em minutos (padrão: 15min) */
export const ACCESS_TOKEN_EXPIRY = parseInt(process.env.JWT_ACCESS_EXPIRY || '15', 10);

/** Tempo de expiração do Refresh Token em minutos (padrão: 7 dias = 10080min) */
export const REFRESH_TOKEN_EXPIRY = parseInt(process.env.JWT_REFRESH_EXPIRY || '10080', 10);

/** Nome do cookie HTTP-Only para o Refresh Token */
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Rotas públicas que não exigem autenticação */
export const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
];

/** Rotas de API públicas que não exigem autenticação Bearer */
export const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/setup-admin',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

/** Hierarquia de roles: ADMIN > GERENTE > FUNCIONARIO */
export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  GERENTE: 2,
  FUNCIONARIO: 1,
};

/** Verifica se um role tem nível igual ou superior ao role exigido */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
