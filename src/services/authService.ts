// ============================================================
// Auth Service — Login, Logout, Refresh, Registro
// ============================================================

import { v4 as uuidv4 } from 'uuid';

import * as UserRepository from '@/repository/userRepository';
import * as SessionRepository from '@/repository/sessionRepository';
import * as AuditLogRepository from '@/repository/auditLogRepository';
import { hashSenha, verificarSenha, gerarAccessToken, gerarRefreshToken, validarRefreshToken } from '@/lib/auth';
import { REFRESH_TOKEN_EXPIRY } from '@/lib/auth/constants';
import type { ApiResponse, AuthTokens, LoginFormData, UsuarioFormData, UsuarioPublico, Role, JWTPayload } from '@/types';

/** Remove a senha do objeto usuário para retorno seguro */
function toPublico(usuario: { id: string; nome: string; email: string; role: Role; ativo: boolean; criadoEm: string; atualizadoEm: string }): UsuarioPublico {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
  };
}

// ============================================================
// LOGIN
// ============================================================

export async function login(
  dados: LoginFormData,
  ip: string | null,
  userAgent: string | null,
): Promise<ApiResponse<{ usuario: UsuarioPublico; tokens: AuthTokens }>> {
  try {
    const usuario = await UserRepository.buscarPorEmail(dados.email);

    if (!usuario) {
      return { success: false, message: 'Email ou senha inválidos.' };
    }

    if (!usuario.ativo) {
      return { success: false, message: 'Usuário desativado. Entre em contato com o administrador.' };
    }

    const senhaValida = await verificarSenha(dados.senha, usuario.senha);
    if (!senhaValida) {
      return { success: false, message: 'Email ou senha inválidos.' };
    }

    // Criar sessão
    const sessionId = uuidv4();
    const jwtPayload: JWTPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      sessionId,
    };

    const accessToken = await gerarAccessToken(jwtPayload);
    const refreshToken = await gerarRefreshToken(jwtPayload);

    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + REFRESH_TOKEN_EXPIRY * 60 * 1000);

    await SessionRepository.salvar({
      id: sessionId,
      userId: usuario.id,
      refreshToken,
      ip,
      userAgent,
      ultimaAtividade: agora.toISOString(),
      ativo: true,
      criadoEm: agora.toISOString(),
      expiraEm: expiraEm.toISOString(),
    });

    // Audit log
    await AuditLogRepository.registrar(usuario.id, 'LOGIN', null, ip, userAgent);

    return {
      success: true,
      message: 'Login realizado com sucesso.',
      data: {
        usuario: toPublico(usuario),
        tokens: { accessToken, refreshToken },
      },
    };
  } catch {
    return { success: false, message: 'Erro ao realizar login.' };
  }
}

// ============================================================
// REGISTRO
// ============================================================

export async function registrar(
  dados: UsuarioFormData,
  ip: string | null,
  userAgent: string | null,
  criadorId?: string,
): Promise<ApiResponse<UsuarioPublico>> {
  try {
    if (!dados.nome?.trim()) {
      return { success: false, message: 'O campo Nome é obrigatório.' };
    }
    if (!dados.email?.trim()) {
      return { success: false, message: 'O campo Email é obrigatório.' };
    }
    if (!dados.senha || dados.senha.length < 6) {
      return { success: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    const emailNormalizado = dados.email.trim().toLowerCase();
    const existente = await UserRepository.buscarPorEmail(emailNormalizado);
    if (existente) {
      return { success: false, message: 'Já existe um usuário com este email.' };
    }

    const agora = new Date().toISOString();
    const senhaHash = await hashSenha(dados.senha);

    const novoUsuario = {
      id: uuidv4(),
      nome: dados.nome.trim(),
      email: emailNormalizado,
      senha: senhaHash,
      role: (dados.role || 'FUNCIONARIO') as Role,
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora,
    };

    await UserRepository.salvar(novoUsuario);

    // Audit log
    await AuditLogRepository.registrar(
      criadorId || novoUsuario.id,
      'CRIACAO_USUARIO',
      `Usuário criado: ${novoUsuario.email} (${novoUsuario.role})`,
      ip,
      userAgent,
    );

    return {
      success: true,
      message: 'Usuário cadastrado com sucesso.',
      data: toPublico(novoUsuario),
    };
  } catch {
    return { success: false, message: 'Erro ao cadastrar usuário.' };
  }
}

// ============================================================
// REFRESH TOKEN
// ============================================================

export async function refresh(
  currentRefreshToken: string,
  ip: string | null,
  userAgent: string | null,
): Promise<ApiResponse<{ tokens: AuthTokens }>> {
  try {
    // Validar JWT do refresh token
    const payload = await validarRefreshToken(currentRefreshToken);
    if (!payload) {
      return { success: false, message: 'Refresh token inválido ou expirado.' };
    }

    // Verificar sessão no banco
    const sessao = await SessionRepository.buscarPorRefreshToken(currentRefreshToken);
    if (!sessao || !sessao.ativo) {
      return { success: false, message: 'Sessão inválida ou encerrada.' };
    }

    // Verificar se expirou
    if (new Date(sessao.expiraEm) < new Date()) {
      await SessionRepository.desativar(sessao.id);
      return { success: false, message: 'Sessão expirada. Faça login novamente.' };
    }

    // Verificar se usuário ainda está ativo
    const usuario = await UserRepository.buscarPorId(sessao.userId);
    if (!usuario || !usuario.ativo) {
      await SessionRepository.desativar(sessao.id);
      return { success: false, message: 'Usuário desativado.' };
    }

    // Gerar novos tokens (rotação de refresh token)
    const jwtPayload: JWTPayload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      sessionId: sessao.id,
    };

    const newAccessToken = await gerarAccessToken(jwtPayload);
    const newRefreshToken = await gerarRefreshToken(jwtPayload);

    // Atualizar sessão com novo refresh token
    await SessionRepository.atualizarAtividade(sessao.id, newRefreshToken);

    return {
      success: true,
      message: 'Tokens renovados com sucesso.',
      data: {
        tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      },
    };
  } catch {
    return { success: false, message: 'Erro ao renovar tokens.' };
  }
}

// ============================================================
// LOGOUT
// ============================================================

export async function logout(
  sessionId: string,
  userId: string,
  ip: string | null,
  userAgent: string | null,
): Promise<ApiResponse> {
  try {
    await SessionRepository.desativar(sessionId);
    await AuditLogRepository.registrar(userId, 'LOGOUT', null, ip, userAgent);

    return { success: true, message: 'Logout realizado com sucesso.' };
  } catch {
    return { success: false, message: 'Erro ao realizar logout.' };
  }
}

// ============================================================
// LOGOUT DE TODOS OS DISPOSITIVOS
// ============================================================

export async function logoutAll(
  userId: string,
  ip: string | null,
  userAgent: string | null,
): Promise<ApiResponse> {
  try {
    await SessionRepository.desativarTodasDoUsuario(userId);
    await AuditLogRepository.registrar(userId, 'LOGOUT_ALL', null, ip, userAgent);

    return { success: true, message: 'Todas as sessões foram encerradas.' };
  } catch {
    return { success: false, message: 'Erro ao encerrar sessões.' };
  }
}

// ============================================================
// ME — Dados do usuário autenticado
// ============================================================

export async function me(userId: string): Promise<ApiResponse<UsuarioPublico>> {
  try {
    const usuario = await UserRepository.buscarPorId(userId);
    if (!usuario) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    return {
      success: true,
      message: 'Dados do usuário.',
      data: toPublico(usuario),
    };
  } catch {
    return { success: false, message: 'Erro ao buscar dados do usuário.' };
  }
}
