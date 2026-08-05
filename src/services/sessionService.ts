// ============================================================
// Session Service — Gestão de sessões do usuário
// ============================================================

import * as SessionRepository from '@/repository/sessionRepository';
import type { ApiResponse, SessaoPublica } from '@/types';

/** Converte sessão interna para formato público (sem refresh token) */
function toPublica(
  sessao: { id: string; ip: string | null; userAgent: string | null; ultimaAtividade: string; criadoEm: string; expiraEm: string },
  sessionIdAtual: string,
): SessaoPublica {
  return {
    id: sessao.id,
    ip: sessao.ip,
    userAgent: sessao.userAgent,
    ultimaAtividade: sessao.ultimaAtividade,
    criadoEm: sessao.criadoEm,
    expiraEm: sessao.expiraEm,
    atual: sessao.id === sessionIdAtual,
  };
}

export async function listarSessoes(
  userId: string,
  sessionIdAtual: string,
): Promise<ApiResponse<SessaoPublica[]>> {
  try {
    const sessoes = await SessionRepository.listarPorUsuario(userId);
    const sessoesPublicas = sessoes.map((s) => toPublica(s, sessionIdAtual));

    return {
      success: true,
      message: 'Sessões carregadas.',
      data: sessoesPublicas,
    };
  } catch {
    return { success: false, message: 'Erro ao listar sessões.' };
  }
}

export async function encerrarSessao(
  sessionId: string,
  userId: string,
): Promise<ApiResponse> {
  try {
    const sessao = await SessionRepository.buscarPorId(sessionId);

    if (!sessao) {
      return { success: false, message: 'Sessão não encontrada.' };
    }

    if (sessao.userId !== userId) {
      return { success: false, message: 'Sem permissão para encerrar esta sessão.' };
    }

    await SessionRepository.desativar(sessionId);

    return { success: true, message: 'Sessão encerrada com sucesso.' };
  } catch {
    return { success: false, message: 'Erro ao encerrar sessão.' };
  }
}
