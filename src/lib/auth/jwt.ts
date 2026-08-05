// ============================================================
// Utilitários de JWT (jose - compatível com Edge Runtime)
// ============================================================

import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '@/types';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from './constants';

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado.');
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET não configurado.');
  return new TextEncoder().encode(secret);
}

/** Gera um Access Token (curta duração) */
export async function gerarAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRY}m`)
    .sign(getAccessSecret());
}

/** Gera um Refresh Token (longa duração) */
export async function gerarRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRY}m`)
    .sign(getRefreshSecret());
}

/** Valida e decodifica um Access Token */
export async function validarAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/** Valida e decodifica um Refresh Token */
export async function validarRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
