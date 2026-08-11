import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { hasPermission } from '@/lib/auth/constants';
import * as ProdutoService from '@/services/produtoService';
import type { ProdutoFormData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    const incluirInativos = request.nextUrl.searchParams.get('incluirInativos') === 'true';

    if (incluirInativos && !hasPermission(authUser.role, 'GERENTE')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente para visualizar produtos inativos.' },
        { status: 403 }
      );
    }

    const resposta = await ProdutoService.buscarTodos(incluirInativos);
    if (!resposta.success) {
      return NextResponse.json(resposta, { status: 400 });
    }
    return NextResponse.json(resposta, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    if (!hasPermission(authUser.role, 'FUNCIONARIO')) {
      return NextResponse.json(
        { success: false, message: 'Permissão insuficiente para cadastrar produtos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (body && typeof body === 'object') {
      delete (body as Record<string, unknown>).userId;
    }
    const dados: ProdutoFormData = body as ProdutoFormData;

    const resposta = await ProdutoService.cadastrarProduto(dados, authUser.sub);
    if (!resposta.success) {
      return NextResponse.json(resposta, { status: 400 });
    }
    return NextResponse.json(resposta, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor ou corpo da requisição inválido.' },
      { status: 500 }
    );
  }
}
