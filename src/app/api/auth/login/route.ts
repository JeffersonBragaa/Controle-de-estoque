import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_EXPIRY } from '@/lib/auth/constants';
import { getClientInfo } from '@/utils/request';
import type { LoginFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const dados: LoginFormData = await request.json();
    const { ip, userAgent } = getClientInfo(request);

    if (!dados.email || !dados.senha) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios.' },
        { status: 400 },
      );
    }

    const resposta = await AuthService.login(dados, ip, userAgent);

    if (!resposta.success || !resposta.data) {
      return NextResponse.json(resposta, { status: 401 });
    }

    // Setar Refresh Token como HTTP-Only Cookie
    const response = NextResponse.json(
      {
        success: true,
        message: resposta.message,
        data: {
          usuario: resposta.data.usuario,
          accessToken: resposta.data.tokens.accessToken,
        },
      },
      { status: 200 },
    );

    response.cookies.set(REFRESH_TOKEN_COOKIE, resposta.data.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRY * 60, // em segundos
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
