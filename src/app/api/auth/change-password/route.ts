import { NextRequest, NextResponse } from 'next/server';
import * as PasswordResetService from '@/services/passwordResetService';
import { getAuthUser } from '@/lib/auth';
import { getClientInfo } from '@/utils/request';
import type { AlterarSenhaData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    const dados: AlterarSenhaData = await request.json();
    const { ip, userAgent } = getClientInfo(request);

    if (!dados.senhaAtual || !dados.novaSenha) {
      return NextResponse.json(
        { success: false, message: 'Senha atual e nova senha são obrigatórios.' },
        { status: 400 },
      );
    }

    const resposta = await PasswordResetService.alterarSenha(
      auth.sub,
      dados.senhaAtual,
      dados.novaSenha,
      ip,
      userAgent,
    );

    if (!resposta.success) {
      return NextResponse.json(resposta, { status: 400 });
    }

    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
