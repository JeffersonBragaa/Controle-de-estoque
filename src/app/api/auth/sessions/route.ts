import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import * as SessionService from '@/services/sessionService';
import { getAuthUser } from '@/lib/auth';
import { REFRESH_TOKEN_COOKIE } from '@/lib/auth/constants';
import { getClientInfo } from '@/utils/request';

/** GET — Listar sessões ativas do usuário autenticado */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    const resposta = await SessionService.listarSessoes(auth.sub, auth.sessionId);

    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}

/** DELETE — Logout de todos os dispositivos */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    const { ip, userAgent } = getClientInfo(request);
    const resposta = await AuthService.logoutAll(auth.sub, ip, userAgent);

    // Limpar cookie local
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
