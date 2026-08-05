// ============================================================
// Utilitários de Hash (BCrypt)
// ============================================================

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/** Gera hash BCrypt de uma senha */
export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

/** Verifica se uma senha corresponde ao hash */
export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
