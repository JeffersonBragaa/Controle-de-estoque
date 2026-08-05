import { NextRequest, NextResponse } from 'next/server';
import * as SessionService from '@/services/sessionService';
import { getAuthUser } from '@/lib/auth';

/** DELETE — Encerrar uma sessão específica */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 },
      );
    }

    const { id } = await params;
    const resposta = await SessionService.encerrarSessao(id, auth.sub);

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
