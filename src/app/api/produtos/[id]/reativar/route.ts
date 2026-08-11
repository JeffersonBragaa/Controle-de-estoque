import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { hasPermission } from '@/lib/auth/constants';
import * as ProdutoService from '@/services/produtoService';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    if (!hasPermission(authUser.role, 'GERENTE')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente para reativar produtos.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const resposta = await ProdutoService.reativarProduto(id);
    if (!resposta.success) {
      const status = resposta.message === 'Produto não encontrado.' ? 404 : 400;
      return NextResponse.json(resposta, { status });
    }
    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
