import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import { getAuthUser } from '@/lib/auth';
import { REFRESH_TOKEN_COOKIE } from '@/lib/auth/constants';
import { getClientInfo } from '@/utils/request';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    const { ip, userAgent } = getClientInfo(request);
    const resposta = await AuthService.logout(auth.sessionId, auth.sub, ip, userAgent);

    // Limpar cookie do refresh token
    const response = NextResponse.json(resposta, { status: 200 });
    response.cookies.delete(REFRESH_TOKEN_COOKIE);

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
