import { NextRequest, NextResponse } from 'next/server';
import * as PasswordResetService from '@/services/passwordResetService';
import { getClientInfo } from '@/utils/request';

export async function POST(request: NextRequest) {
  try {
    const { token, novaSenha } = await request.json();
    const { ip, userAgent } = getClientInfo(request);

    if (!token || !novaSenha) {
      return NextResponse.json(
        { success: false, message: 'Token e nova senha são obrigatórios.' },
        { status: 400 },
      );
    }

    const resposta = await PasswordResetService.resetarSenha(token, novaSenha, ip, userAgent);

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
