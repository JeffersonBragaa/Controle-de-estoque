import { NextRequest, NextResponse } from 'next/server';
import * as PasswordResetService from '@/services/passwordResetService';
import { getClientInfo } from '@/utils/request';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const { ip, userAgent } = getClientInfo(request);

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'O campo email é obrigatório.' },
        { status: 400 },
      );
    }

    const resposta = await PasswordResetService.solicitarRecuperacao(
      email.trim().toLowerCase(),
      ip,
      userAgent,
    );

    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
