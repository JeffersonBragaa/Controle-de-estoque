import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_EXPIRY } from '@/lib/auth/constants';
import { getClientInfo } from '@/utils/request';
import type { LoginFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const dados: LoginFormData = await request.json();
    const { ip, userAgent } = getClientInfo(request);

    const emailRecebido = dados.email ? dados.email.trim().toLowerCase() : '(vazio)';
    console.log('[LOGIN_ROUTE] Recebida requisição de login para:', emailRecebido);

    if (!dados.email || !dados.senha) {
      console.log('[LOGIN_ROUTE] Email ou senha não fornecidos no body');
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios.' },
        { status: 400 },
      );
    }

    const resposta = await AuthService.login(dados, ip, userAgent);
    console.log('[LOGIN_ROUTE] Resposta do AuthService:', {
      success: resposta.success,
      message: resposta.message,
      hasData: !!resposta.data,
    });

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
  } catch (error) {
    console.error(
      '[LOGIN_ROUTE] EXCECAO no route handler de login:',
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
