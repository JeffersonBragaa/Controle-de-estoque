// ============================================================
// Password Reset Service — Fluxo completo de recuperação de senha
// ============================================================

import { v4 as uuidv4 } from 'uuid';

import * as UserRepository from '@/repository/userRepository';
import * as PasswordResetRepository from '@/repository/passwordResetRepository';
import * as SessionRepository from '@/repository/sessionRepository';
import * as AuditLogRepository from '@/repository/auditLogRepository';
import { hashSenha } from '@/lib/auth';
import type { ApiResponse } from '@/types';

/** Tempo de expiração do token de recuperação em minutos (30min) */
const RESET_TOKEN_EXPIRY = 30;

// ============================================================
// SOLICITAR RECUPERAÇÃO
// ============================================================

export async function solicitarRecuperacao(
  email: string,
  ip: string | null,
  userAgent: string | null,
): Promise<ApiResponse> {
  try {
    // Sempre retorna sucesso para não revelar se o email existe
    const usuario = await UserRepository.buscarPorEmail(email);

    if (usuario && usuario.ativo) {
      // Invalidar tokens anteriores
      await PasswordResetRepository.invalidarTodosDoUsuario(usuario.id);

      // Gerar novo token
      const token = uuidv4();
      const agora = new Date();
      const expiraEm = new Date(agora.getTime() + RESET_TOKEN_EXPIRY * 60 * 1000);

      await PasswordResetRepository.salvar({
        id: uuidv4(),
        userId: usuario.id,
        token,
        expiraEm: expiraEm.toISOString(),
        usado: false,
        criadoEm: agora.toISOString(),
      });

      await AuditLogRepository.registrar(
        usuario.id,
        'RECUPERACAO_SENHA_SOLICITADA',
        null,
        ip,
        userAgent,
      );

      // Em produção, enviar email com link contendo o token.
      // Por enquanto, logamos no console para desenvolvimento.
      console.log(`[RECUPERAÇÃO DE SENHA] Token para ${email}: ${token}`);
      console.log(`[RECUPERAÇÃO DE SENHA] Link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`);
    }

    return {
      success: true,
      message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação.',
    };
  } catch {
    return { success: false, message: 'Erro ao processar solicitação de recuperação.' };
  }
}

// ============================================================
// RESETAR SENHA
// ============================================================

export async function resetarSenha(
  token: string,
  novaSenha: string,
  ip: string | null,
  userAgent: string | null,
): Promise<ApiResponse> {
  try {
    if (!novaSenha || novaSenha.length < 6) {
      return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const reset = await PasswordResetRepository.buscarPorToken(token);

    if (!reset) {
      return { success: false, message: 'Token de recuperação inválido.' };
    }

    if (new Date(reset.expiraEm) < new Date()) {
      await PasswordResetRepository.marcarComoUsado(reset.id);
      return { success: false, message: 'Token de recuperação expirado. Solicite novamente.' };
    }

    // Atualizar senha
    const senhaHash = await hashSenha(novaSenha);
    await UserRepository.atualizar(reset.userId, {
      senha: senhaHash,
      atualizadoEm: new Date().toISOString(),
    });

    // Marcar token como usado
    await PasswordResetRepository.marcarComoUsado(reset.id);

    // Invalidar todas as sessões (segurança: forçar re-login com nova senha)
    await SessionRepository.desativarTodasDoUsuario(reset.userId);

    await AuditLogRepository.registrar(
      reset.userId,
      'RECUPERACAO_SENHA_CONCLUIDA',
      null,
      ip,
      userAgent,
    );

    return {
      success: true,
      message: 'Senha alterada com sucesso. Faça login com a nova senha.',
    };
  } catch {
    return { success: false, message: 'Erro ao resetar senha.' };
  }
}

// ============================================================
// ALTERAR SENHA (usuário autenticado)
// ============================================================

export async function alterarSenha(
  userId: string,
  senhaAtual: string,
  novaSenha: string,
  ip: string | null,
  userAgent: string | null,
): Promise<ApiResponse> {
  try {
    if (!novaSenha || novaSenha.length < 6) {
      return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const usuario = await UserRepository.buscarPorId(userId);
    if (!usuario) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const { verificarSenha: verify } = await import('@/lib/auth');
    const senhaValida = await verify(senhaAtual, usuario.senha);
    if (!senhaValida) {
      return { success: false, message: 'Senha atual incorreta.' };
    }

    const senhaHash = await hashSenha(novaSenha);
    await UserRepository.atualizar(userId, {
      senha: senhaHash,
      atualizadoEm: new Date().toISOString(),
    });

    await AuditLogRepository.registrar(userId, 'ALTERACAO_SENHA', null, ip, userAgent);

    return { success: true, message: 'Senha alterada com sucesso.' };
  } catch {
    return { success: false, message: 'Erro ao alterar senha.' };
  }
}
