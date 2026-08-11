// ============================================================
// Tipos de Autenticação e Segurança
// ============================================================

export type Role = 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: Role;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UsuarioFormData {
  nome: string;
  email: string;
  senha: string;
  role?: Role;
}

export interface LoginFormData {
  email: string;
  senha: string;
}

export interface Sessao {
  id: string;
  userId: string;
  refreshToken: string;
  ip: string | null;
  userAgent: string | null;
  ultimaAtividade: string;
  ativo: boolean;
  criadoEm: string;
  expiraEm: string;
}

export interface SessaoPublica {
  id: string;
  ip: string | null;
  userAgent: string | null;
  ultimaAtividade: string;
  criadoEm: string;
  expiraEm: string;
  atual: boolean;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  acao: string;
  detalhes: string | null;
  ip: string | null;
  userAgent: string | null;
  criadoEm: string;
}

export type AcaoAuditoria =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGOUT_ALL'
  | 'ALTERACAO_SENHA'
  | 'RECUPERACAO_SENHA_SOLICITADA'
  | 'RECUPERACAO_SENHA_CONCLUIDA'
  | 'CRIACAO_USUARIO'
  | 'EXCLUSAO_USUARIO'
  | 'CRIACAO_PRODUTO'
  | 'ALTERACAO_PRODUTO'
  | 'DESATIVACAO_PRODUTO'
  | 'REATIVACAO_PRODUTO';

export interface PasswordReset {
  id: string;
  userId: string;
  token: string;
  expiraEm: string;
  usado: boolean;
  criadoEm: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AlterarSenhaData {
  senhaAtual: string;
  novaSenha: string;
}
