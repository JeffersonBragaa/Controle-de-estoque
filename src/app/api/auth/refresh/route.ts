import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_EXPIRY } from '@/lib/auth/constants';
import { getClientInfo } from '@/utils/request';

export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent } = getClientInfo(request);

    // Ler refresh token do cookie HTTP-Only
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token não encontrado.' },
        { status: 401 },
      );
    }

    const resposta = await AuthService.refresh(refreshToken, ip, userAgent);

    if (!resposta.success || !resposta.data) {
      // Limpar cookie inválido
      const response = NextResponse.json(resposta, { status: 401 });
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }

    const response = NextResponse.json(
      {
        success: true,
        message: resposta.message,
        data: {
          accessToken: resposta.data.tokens.accessToken,
        },
      },
      { status: 200 },
    );

    // Atualizar cookie com novo refresh token (rotação)
    response.cookies.set(REFRESH_TOKEN_COOKIE, resposta.data.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRY * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
