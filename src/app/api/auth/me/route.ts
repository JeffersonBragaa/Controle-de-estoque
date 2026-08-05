import { NextRequest, NextResponse } from 'next/server';
import * as AuthService from '@/services/authService';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    const resposta = await AuthService.me(auth.sub);

    if (!resposta.success) {
      return NextResponse.json(resposta, { status: 404 });
    }

    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 },
    );
  }
}
